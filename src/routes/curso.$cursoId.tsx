import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Meta } from "@/components/shell";
import { Reproductor } from "@/components/reproductor";
import { useContexto } from "@/components/use-contexto";
import { completarLeccion, obtenerCursoVista } from "@/lib/estudia/lms-api";

export const Route = createFileRoute("/curso/$cursoId")({ component: CursoPage });

function CursoPage() {
  const { cursoId } = Route.useParams();
  const { ctx } = useContexto();
  const [vista, setVista] = useState<Awaited<ReturnType<typeof obtenerCursoVista>> | null>(null);
  const [activa, setActiva] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function cargar() {
    return obtenerCursoVista({ data: cursoId }).then((siguiente) => {
      setVista(siguiente);
      setActiva((prev) => prev ?? siguiente.lecciones[0]?.id ?? null);
    });
  }

  useEffect(() => {
    void cargar();
  }, [cursoId, ctx?.usuario?.xp]);

  const leccion = vista?.lecciones.find((item) => item.id === activa) ?? vista?.lecciones[0];

  return (
    <Shell cliente={ctx?.cliente.nombre} gestionar={ctx?.usuario?.puedeGestionar}>
      <Link to="/" className="text-sm text-muted">
        Classroom
      </Link>
      {!vista ? (
        <p className="mt-6 text-sm text-muted">Cargando temario</p>
      ) : !vista.curso ? (
        <p className="mt-6 text-sm text-muted">Este curso no está en el cliente activo.</p>
      ) : (
        <>
          <h1 className="mt-3 text-4xl">{vista.curso.titulo}</h1>
          <Meta partes={[vista.curso.categoria, vista.curso.nivel, vista.curso.instructor, vista.curso.requiredTier]} />
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{vista.curso.descripcion}</p>
          <div className="mt-6 border border-line bg-panel">
            {leccion ? <Reproductor fuente={leccion.fuente} titulo={leccion.titulo} /> : null}
          </div>
          {leccion ? (
            <div className="mt-4">
              <h2 className="text-xl">{leccion.titulo}</h2>
              <p className="mt-2 text-sm text-muted">{leccion.resumen}</p>
              <button
                type="button"
                className="mt-4 h-11 bg-accent px-4 text-sm font-medium text-on-accent"
                onClick={() => {
                  if (!ctx?.usuario) {
                    setAviso("Entra para guardar el avance.");
                    return;
                  }
                  void completarLeccion({ data: leccion.id })
                    .then(() => cargar())
                    .catch((error: unknown) => setAviso(error instanceof Error ? error.message : "No se pudo marcar"));
                }}
              >
                {vista.completadas.includes(leccion.id) ? "Completada" : "Marcar como completada"}
              </button>
              {aviso ? <p className="mt-2 text-sm text-muted">{aviso}</p> : null}
            </div>
          ) : null}
          <ol className="mt-8 grid gap-px bg-line">
            {vista.lecciones.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiva(item.id)}
                  className="flex h-14 w-full items-center justify-between bg-panel px-4 text-left"
                >
                  <span>
                    <span className="block text-sm">{item.titulo}</span>
                    <span className="font-mono text-sm text-muted tabular-nums">
                      {item.modulo} · {item.duracionMin} min · {item.abierta ? "abierta" : "cerrada"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </Shell>
  );
}
