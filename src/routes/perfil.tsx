import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell, Meta } from "@/components/shell";
import { useContexto } from "@/components/use-contexto";
import { editarPerfil } from "@/lib/estudia/lms-api";
import { abrirAnotacion, cambiarPapel, fijarClienteNegocio } from "@/lib/estudia/api";
import type { Papel } from "@/lib/estudia/contrato";

export const Route = createFileRoute("/perfil")({ component: Perfil });

function Perfil() {
  const { ctx, cargar } = useContexto();
  const usuario = ctx?.usuario;
  const [titular, setTitular] = useState("");
  const [bio, setBio] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [nota, setNota] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [anotacion, setAnotacion] = useState("");

  useEffect(() => {
    if (!usuario) return;
    setTitular(usuario.titular);
    setBio(usuario.bio);
    setEspecialidad(usuario.especialidad);
  }, [usuario?.nombre, usuario?.titular, usuario?.bio, usuario?.especialidad]);

  function guardar(event: FormEvent) {
    event.preventDefault();
    void editarPerfil({ data: { titular, bio, especialidad } }).then(() => cargar());
  }

  async function papel(siguiente: Papel) {
    await cambiarPapel({ data: siguiente });
    await cargar();
  }

  return (
    <Shell cliente={ctx?.cliente.nombre} gestionar={ctx?.usuario?.puedeGestionar}>
      <h1 className="text-4xl">Perfil</h1>
      {!usuario ? (
        <p className="mt-4 text-sm text-muted">Entra para guardar tu ficha en este cliente.</p>
      ) : (
        <>
          <Meta partes={[usuario.rol, usuario.plan, `${usuario.xp} XP`]} />
          <form onSubmit={guardar} className="mt-6 grid gap-2">
            <input value={titular} onChange={(event) => setTitular(event.target.value)} placeholder="Titular" className="h-11 border border-line bg-ink px-3" />
            <input value={especialidad} onChange={(event) => setEspecialidad(event.target.value)} placeholder="Especialidad" className="h-11 border border-line bg-ink px-3" />
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Biografía" className="min-h-24 border border-line bg-ink px-3 py-2" />
            <button type="submit" className="h-11 bg-accent text-sm font-medium text-on-accent">Guardar</button>
          </form>
        </>
      )}
      {usuario ? (
        <section className="mt-10 border-t border-line pt-6">
          <h2 className="text-xl">Papel ConfIA360</h2>
          <p className="mt-2 text-sm text-muted">
            Ahora: {ctx?.papel}. Plataforma no gestiona cursos. Socio, un cliente anotado. Administrador, el suyo fijado.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["plataforma", "socio", "administrador"] as const).map((item) => (
              <button key={item} type="button" className="h-11 border border-line px-3 text-sm" onClick={() => void papel(item)}>
                {item}
              </button>
            ))}
          </div>
          {ctx?.papel === "plataforma" ? null : (
          <form
            className="mt-4 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const accion =
                ctx?.papel === "administrador"
                  ? fijarClienteNegocio({ data: nombreCliente })
                  : abrirAnotacion({ data: { nombre: nombreCliente, nota: anotacion || "Apertura" } });
              void accion
                .then(() => cargar())
                .catch((error: unknown) => setNota(error instanceof Error ? error.message : "No se pudo"));
            }}
          >
            <input value={nombreCliente} onChange={(event) => setNombreCliente(event.target.value)} placeholder="Nombre del cliente" className="h-11 border border-line bg-ink px-3" />
            {ctx?.papel === "socio" ? (
              <input value={anotacion} onChange={(event) => setAnotacion(event.target.value)} placeholder="Anotación" className="h-11 border border-line bg-ink px-3" />
            ) : null}
            <button type="submit" className="h-11 text-sm">
              {ctx?.papel === "administrador" ? "Fijar negocio" : "Anotar cliente"}
            </button>
          </form>
          )}
          {nota ? <p className="mt-2 text-sm text-bad">{nota}</p> : null}
        </section>
      ) : null}
    </Shell>
  );
}
