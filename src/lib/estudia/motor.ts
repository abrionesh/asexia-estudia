import {
  Aislamiento,
  BIBLIOTECA_ESTUDIA,
  clienteDeEscritura,
  clienteDeLectura,
  limpiarTitulo,
  type Alcance,
  type Formacion,
} from "./contrato.ts";

export type EstudiaStore = {
  listar(clienteId: string): Promise<Formacion[]>;
  crear(clienteId: string, titulo: string): Promise<Formacion>;
};

export function crearEstudia(store: EstudiaStore) {
  return {
    biblioteca: BIBLIOTECA_ESTUDIA,
    async listar(alcance: Alcance): Promise<Formacion[]> {
      const clienteId = clienteDeLectura(alcance);
      if (!clienteId) return [];
      const filas = await store.listar(clienteId);
      return filas.filter((fila) => fila.clienteId === clienteId);
    },
    async crear(alcance: Alcance, titulo: string): Promise<Formacion> {
      const clienteId = clienteDeEscritura(alcance);
      const limpio = limpiarTitulo(titulo);
      const fila = await store.crear(clienteId, limpio);
      if (fila.clienteId !== clienteId) {
        throw new Aislamiento("La biblioteca devolvió otro cliente");
      }
      return fila;
    },
  };
}

export type Estudia = ReturnType<typeof crearEstudia>;
