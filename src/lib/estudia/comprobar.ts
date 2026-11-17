import { Aislamiento, ClienteRequerido, PapelSinDatos, rechazarSiAjeno } from "./contrato.ts";
import { storeEnMemoria } from "./memoria.ts";
import { crearEstudia } from "./motor.ts";

export type PasoContrato = { nombre: string; ok: boolean };

/** Prueba en memoria. No toca clientes reales. */
export async function comprobarAislamiento(): Promise<{ ok: boolean; pasos: PasoContrato[] }> {
  const store = storeEnMemoria();
  const estudia = crearEstudia({
    async listar(clienteId) {
      const filas = await store.listar(clienteId);
      if (clienteId === "cliente-a") {
        return [
          ...filas,
          {
            id: "veneno",
            clienteId: "cliente-b",
            titulo: "No debe verse",
            creadoEn: "",
          },
        ];
      }
      return filas;
    },
    crear: (clienteId, titulo) => store.crear(clienteId, titulo),
  });

  const pasos: PasoContrato[] = [];
  const anotar = (nombre: string, ok: boolean) => pasos.push({ nombre, ok });

  const creada = await estudia.crear(
    { papel: "socio", clienteId: "cliente-a" },
    "Oficio de sala",
  );
  anotar("Escribe en el cliente del alcance", creada.clienteId === "cliente-a");

  const ajenas = await estudia.listar({ papel: "administrador", clienteId: "cliente-b" });
  anotar("Otro cliente no ve la formación", ajenas.length === 0);

  const propias = await estudia.listar({ papel: "socio", clienteId: "cliente-a" });
  anotar(
    "El mismo cliente la ve, y descarta una fila ajena",
    propias.length === 1 && propias[0]?.id === creada.id,
  );

  const plataforma = await estudia.listar({ papel: "plataforma", clienteId: null });
  anotar("Plataforma no lee datos", plataforma.length === 0);

  let sinCliente = false;
  try {
    await estudia.listar({ papel: "administrador", clienteId: null });
  } catch (error) {
    sinCliente = error instanceof ClienteRequerido;
  }
  anotar("Sin cliente no se lee", sinCliente);

  let plataformaNoEscribe = false;
  try {
    await estudia.crear({ papel: "plataforma", clienteId: null }, "No");
  } catch (error) {
    plataformaNoEscribe = error instanceof PapelSinDatos;
  }
  anotar("Plataforma no escribe", plataformaNoEscribe);

  let ajeno = false;
  try {
    rechazarSiAjeno("cliente-a", "cliente-b");
  } catch (error) {
    ajeno = error instanceof Aislamiento;
  }
  anotar("Un id ajeno no se consulta", ajeno);

  return { ok: pasos.every((paso) => paso.ok), pasos };
}
