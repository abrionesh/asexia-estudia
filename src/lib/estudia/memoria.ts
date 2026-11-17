import type { Formacion } from "./contrato.ts";
import type { EstudiaStore } from "./motor.ts";

export function storeEnMemoria(): EstudiaStore & { filas(): Formacion[] } {
  const filas: Formacion[] = [];
  return {
    filas: () => filas,
    async listar(clienteId) {
      return filas.filter((fila) => fila.clienteId === clienteId);
    },
    async crear(clienteId, titulo) {
      const fila: Formacion = {
        id: `mem-${filas.length + 1}`,
        clienteId,
        titulo,
        creadoEn: new Date(0).toISOString(),
      };
      filas.push(fila);
      return fila;
    },
  };
}
