import { getSql } from "../db.ts";
import { ClienteRequerido, type Formacion } from "./contrato.ts";
import { SQL_CREAR_FORMACION, SQL_LISTAR_FORMACIONES } from "./consultas.ts";
import type { EstudiaStore } from "./motor.ts";

type Fila = {
  id: string;
  titulo: string;
  cliente_id: string;
  creado_en: string;
};

function aFormacion(fila: Fila): Formacion {
  return {
    id: fila.id,
    titulo: fila.titulo,
    clienteId: fila.cliente_id,
    creadoEn: fila.creado_en,
  };
}

export function storePostgres(): EstudiaStore {
  return {
    async listar(clienteId) {
      if (!clienteId) throw new ClienteRequerido();
      const sql = await getSql();
      const filas = await sql.query<Fila>(SQL_LISTAR_FORMACIONES, [clienteId]);
      return filas.map(aFormacion);
    },
    async crear(clienteId, titulo) {
      if (!clienteId) throw new ClienteRequerido();
      const sql = await getSql();
      const filas = await sql.query<Fila>(SQL_CREAR_FORMACION, [
        crypto.randomUUID(),
        clienteId,
        titulo,
      ]);
      const fila = filas[0];
      if (!fila || fila.cliente_id !== clienteId) {
        throw new ClienteRequerido("No se escribió la formación");
      }
      return aFormacion(fila);
    },
  };
}
