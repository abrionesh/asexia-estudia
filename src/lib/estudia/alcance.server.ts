import { getSql } from "../db.ts";
import {
  Aislamiento,
  puedeFijarNegocio,
  puedeReabrir,
  type Alcance,
  type AnotacionVista,
  type Papel,
  esPapel,
} from "./contrato.ts";

type PapelFila = { papel: string };
type IdFila = { cliente_id: string };
type NombreFila = { id: string; nombre: string };
type AnotacionFila = {
  cliente_id: string;
  nombre: string;
  nota: string;
  desde: string;
  hasta: string | null;
};

export async function leerAlcance(userId: string): Promise<Alcance> {
  const sql = await getSql();
  const papeles = await sql<PapelFila>`
    select papel from estudia_papel where user_id = ${userId}
  `;
  const crudo = papeles[0]?.papel ?? "";
  const papel: Papel = esPapel(crudo) ? crudo : "plataforma";
  if (papel === "plataforma") return { papel, clienteId: null };
  if (papel === "administrador") {
    const vinculo = await sql<IdFila>`
      select cliente_id from estudia_admin where user_id = ${userId}
    `;
    return { papel, clienteId: vinculo[0]?.cliente_id ?? null };
  }
  const abierta = await sql<IdFila>`
    select cliente_id from estudia_anotaciones
    where user_id = ${userId} and hasta is null
  `;
  return { papel, clienteId: abierta[0]?.cliente_id ?? null };
}

export async function fijarPapel(userId: string, papel: Papel): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into estudia_papel (user_id, papel)
    values (${userId}, ${papel})
    on conflict (user_id) do update set papel = excluded.papel
  `;
}

export async function negocioFijado(userId: string): Promise<boolean> {
  const sql = await getSql();
  const filas = await sql<IdFila>`
    select cliente_id from estudia_admin where user_id = ${userId}
  `;
  return Boolean(filas[0]?.cliente_id);
}

export async function fijarNegocio(userId: string, nombre: string): Promise<{ id: string; nombre: string }> {
  if (!puedeFijarNegocio(await negocioFijado(userId))) {
    throw new Aislamiento("El cliente del negocio ya está fijado");
  }
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    with alta as (
      insert into estudia_clientes (id, nombre)
      values (${id}, ${nombre})
      returning id
    )
    insert into estudia_admin (user_id, cliente_id)
    select ${userId}, alta.id from alta
  `;
  return { id, nombre };
}

export async function anotarCliente(
  userId: string,
  nombre: string,
  nota: string,
): Promise<{ id: string; nombre: string }> {
  const sql = await getSql();
  const id = crypto.randomUUID();
  const anotacionId = crypto.randomUUID();
  await sql`
    with alta as (
      insert into estudia_clientes (id, nombre)
      values (${id}, ${nombre})
      returning id
    ),
    cerrar as (
      update estudia_anotaciones
      set hasta = now()
      where user_id = ${userId} and hasta is null
      returning id
    )
    insert into estudia_anotaciones (id, user_id, cliente_id, nota)
    select ${anotacionId}, ${userId}, alta.id, ${nota}
    from alta
  `;
  return { id, nombre };
}

export async function idsAnotados(userId: string): Promise<string[]> {
  const sql = await getSql();
  const filas = await sql<IdFila>`
    select distinct cliente_id from estudia_anotaciones where user_id = ${userId}
  `;
  return filas.map((fila) => fila.cliente_id);
}

export async function reabrirAnotacion(userId: string, clienteId: string, nota: string): Promise<void> {
  const conocidos = await idsAnotados(userId);
  if (!puedeReabrir(conocidos, clienteId)) {
    throw new Aislamiento("Ese cliente no está en tus anotaciones");
  }
  const sql = await getSql();
  const anotacionId = crypto.randomUUID();
  await sql`
    with cerrar as (
      update estudia_anotaciones
      set hasta = now()
      where user_id = ${userId} and hasta is null
      returning id
    )
    insert into estudia_anotaciones (id, user_id, cliente_id, nota)
    values (${anotacionId}, ${userId}, ${clienteId}, ${nota})
  `;
}

export async function nombreCliente(clienteId: string): Promise<{ id: string; nombre: string } | null> {
  const sql = await getSql();
  const filas = await sql<NombreFila>`
    select id, nombre from estudia_clientes where id = ${clienteId}
  `;
  const fila = filas[0];
  return fila ? { id: fila.id, nombre: fila.nombre } : null;
}

export async function anotacionesDe(userId: string): Promise<AnotacionVista[]> {
  const sql = await getSql();
  const filas = await sql<AnotacionFila>`
    select a.cliente_id, c.nombre, a.nota, a.desde::text as desde, a.hasta::text as hasta
    from estudia_anotaciones a
    join estudia_clientes c on c.id = a.cliente_id
    where a.user_id = ${userId}
    order by a.desde desc
  `;
  return filas.map((fila) => ({
    clienteId: fila.cliente_id,
    nombre: fila.nombre,
    nota: fila.nota,
    desde: fila.desde,
    abierta: fila.hasta == null,
  }));
}

export async function notaAbierta(userId: string): Promise<string | null> {
  const sql = await getSql();
  const filas = await sql<{ nota: string }>`
    select nota from estudia_anotaciones
    where user_id = ${userId} and hasta is null
  `;
  return filas[0]?.nota ?? null;
}
