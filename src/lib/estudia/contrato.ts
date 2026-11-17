/** Biblioteca que consume esta app. `formacion` no es otra biblioteca. */
export const BIBLIOTECA_ESTUDIA = {
  id: "estudia",
  version: "1.0.0",
} as const;

export const ALIAS_NO_BIBLIOTECA = "formacion";

export const PAPELES = ["plataforma", "socio", "administrador"] as const;
export type Papel = (typeof PAPELES)[number];

export type Alcance = {
  papel: Papel;
  /** Null solo en plataforma, o si el papel aún no tiene cliente. */
  clienteId: string | null;
};

export type Formacion = {
  id: string;
  clienteId: string;
  titulo: string;
  creadoEn: string;
};

export type AnotacionVista = {
  clienteId: string;
  nombre: string;
  nota: string;
  desde: string;
  abierta: boolean;
};

export type VistaEstudia = {
  biblioteca: typeof BIBLIOTECA_ESTUDIA;
  papel: Papel;
  cliente: { id: string; nombre: string } | null;
  formaciones: Formacion[];
  notaAbierta: string | null;
  negocioFijado: boolean;
  /** Solo el papel socio. Nunca el directorio de todos los clientes. */
  anotaciones: AnotacionVista[];
  motivo: "plataforma" | "sin-cliente" | null;
};

export class ClienteRequerido extends Error {
  constructor(message = "Sin cliente no se lee") {
    super(message);
    this.name = "ClienteRequerido";
  }
}

export class Aislamiento extends Error {
  constructor(message = "Un cliente no ve a otro") {
    super(message);
    this.name = "Aislamiento";
  }
}

export class PapelSinDatos extends Error {
  constructor(message = "La plataforma no lee datos de negocio") {
    super(message);
    this.name = "PapelSinDatos";
  }
}

export function esPapel(value: string): value is Papel {
  return (PAPELES as readonly string[]).includes(value);
}

export function limpiarNombre(value: string): string {
  const nombre = value.trim().replace(/\s+/g, " ");
  if (nombre.length < 2 || nombre.length > 80) {
    throw new Error("El nombre va de 2 a 80 caracteres");
  }
  return nombre;
}

export function limpiarNota(value: string): string {
  const nota = value.trim().replace(/\s+/g, " ");
  if (nota.length < 1 || nota.length > 280) {
    throw new Error("La anotación va de 1 a 280 caracteres");
  }
  return nota;
}

export function limpiarTitulo(value: string): string {
  const titulo = value.trim().replace(/\s+/g, " ");
  if (titulo.length < 1 || titulo.length > 120) {
    throw new Error("El título va de 1 a 120 caracteres");
  }
  return titulo;
}

/** Lectura: plataforma no toca el almacén. Socio y administrador exigen cliente. */
export function clienteDeLectura(alcance: Alcance): string | null {
  if (alcance.papel === "plataforma") return null;
  if (!alcance.clienteId) throw new ClienteRequerido();
  return alcance.clienteId;
}

/** Escritura de negocio: nunca plataforma, nunca sin cliente. */
export function clienteDeEscritura(alcance: Alcance): string {
  if (alcance.papel === "plataforma") throw new PapelSinDatos();
  if (!alcance.clienteId) throw new ClienteRequerido();
  return alcance.clienteId;
}

/** El id pedido tiene que ser el del alcance. Si no, no se consulta. */
export function rechazarSiAjeno(alcanceClienteId: string | null, pedido: string): void {
  if (!alcanceClienteId) throw new ClienteRequerido();
  if (pedido !== alcanceClienteId) throw new Aislamiento();
}

export function puedeReabrir(clientesAnotados: readonly string[], pedido: string): boolean {
  return clientesAnotados.includes(pedido);
}

export function puedeFijarNegocio(yaFijado: boolean): boolean {
  return !yaFijado;
}
