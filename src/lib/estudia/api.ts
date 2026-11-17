import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { comprobarAislamiento } from "./comprobar.ts";
import {
  BIBLIOTECA_ESTUDIA,
  esPapel,
  limpiarNombre,
  limpiarNota,
  limpiarTitulo,
  rechazarSiAjeno,
  type Papel,
  type VistaEstudia,
} from "./contrato.ts";
import {
  anotarCliente,
  anotacionesDe,
  fijarNegocio,
  fijarPapel,
  leerAlcance,
  negocioFijado,
  nombreCliente,
  notaAbierta,
  reabrirAnotacion,
} from "./alcance.server.ts";
import { crearEstudia } from "./motor.ts";
import { storePostgres } from "./store.server.ts";

const estudia = crearEstudia(storePostgres());

export const comprobarContrato = createServerFn({ method: "GET" }).handler(async () => {
  const resultado = await comprobarAislamiento();
  return { biblioteca: BIBLIOTECA_ESTUDIA, ...resultado };
});

export const obtenerVista = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<VistaEstudia> => {
    const userId = context.userId;
    const alcance = await leerAlcance(userId);
    const fijado = await negocioFijado(userId);
    const motivo =
      alcance.papel === "plataforma" ? "plataforma" : alcance.clienteId ? null : "sin-cliente";
    const formaciones = alcance.clienteId
      ? await estudia.listar(alcance)
      : await estudia.listar({ papel: "plataforma", clienteId: null });
    const cliente = alcance.clienteId ? await nombreCliente(alcance.clienteId) : null;
    const anotaciones = alcance.papel === "socio" ? await anotacionesDe(userId) : [];
    const nota = alcance.papel === "socio" ? await notaAbierta(userId) : null;
    return {
      biblioteca: BIBLIOTECA_ESTUDIA,
      papel: alcance.papel,
      cliente,
      formaciones,
      notaAbierta: nota,
      negocioFijado: fijado,
      anotaciones,
      motivo,
    };
  });

export const cambiarPapel = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((papel: string): Papel => {
    if (!esPapel(papel)) throw new Error("Papel desconocido");
    return papel;
  })
  .handler(async ({ context, data }) => {
    await fijarPapel(context.userId, data);
    return { papel: data };
  });

export const fijarClienteNegocio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((nombre: string) => limpiarNombre(nombre))
  .handler(async ({ context, data }) => {
    const alcance = await leerAlcance(context.userId);
    if (alcance.papel !== "administrador") {
      throw new Error("Solo el administrador fija el cliente del negocio");
    }
    return fijarNegocio(context.userId, data);
  });

export const abrirAnotacion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { nombre: string; nota: string }) => ({
    nombre: limpiarNombre(input.nombre),
    nota: limpiarNota(input.nota),
  }))
  .handler(async ({ context, data }) => {
    const alcance = await leerAlcance(context.userId);
    if (alcance.papel !== "socio") {
      throw new Error("Solo el socio anota un cliente");
    }
    return anotarCliente(context.userId, data.nombre, data.nota);
  });

export const volverAnotacion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { clienteId: string; nota: string }) => ({
    clienteId: input.clienteId.trim(),
    nota: limpiarNota(input.nota),
  }))
  .handler(async ({ context, data }) => {
    const alcance = await leerAlcance(context.userId);
    if (alcance.papel !== "socio") {
      throw new Error("Solo el socio reabre una anotación");
    }
    if (!data.clienteId) throw new Error("Falta el cliente");
    await reabrirAnotacion(context.userId, data.clienteId, data.nota);
    return { clienteId: data.clienteId };
  });

export const crearFormacion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((titulo: string) => limpiarTitulo(titulo))
  .handler(async ({ context, data }) => {
    const alcance = await leerAlcance(context.userId);
    return estudia.crear(alcance, data);
  });

export const pedirClienteAjeno = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((clienteId: string) => clienteId.trim())
  .handler(async ({ context, data }) => {
    const alcance = await leerAlcance(context.userId);
    try {
      rechazarSiAjeno(alcance.clienteId, data);
    } catch (error) {
      const motivo = error instanceof Error ? error.message : "Rechazado";
      return { rechazado: true as const, motivo, consultado: false as const };
    }
    return { rechazado: false as const, motivo: "Es el cliente del alcance", consultado: false as const };
  });
