import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useContexto } from "@/components/use-contexto";
import { altaCurso, altaLeccion, altaRecurso, obtenerAula } from "@/lib/estudia/lms-api";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { ctx } = useContexto();
  const [cursos, setCursos] = useState<Awaited<ReturnType<typeof obtenerAula>>["cursos"]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [leccion, setLeccion] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTipo, setVideoTipo] = useState<"youtube" | "vimeo" | "mp4">("youtube");
  const [recurso, setRecurso] = useState("");
  const [aviso, setAviso] = useState("");

  function cargar() {
    return obtenerAula().then((aula) => {
      setCursos(aula.cursos);
      setCursoId((prev) => prev || aula.cursos[0]?.id || "");
    });
  }

  useEffect(() => {
    if (!ctx) return;
    void cargar();
  }, [ctx?.cliente.id]);

  if (!ctx) {
    return (
      <Shell>
        <p className="text-sm text-muted">Cargando</p>
      </Shell>
    );
  }

  if (!ctx.usuario?.puedeGestionar) {
    return (
      <Shell cliente={ctx.cliente.nombre}>
        <h1 className="text-4xl">Administración</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          La plataforma no edita el contenido. Hace falta el papel de socio anotado en este cliente,
          el administrador del negocio, o el rol interno admin o instructor.
        </p>
      </Shell>
    );
  }

  function envolver(accion: Promise<unknown>) {
    setAviso("");
    void accion.then(() => cargar()).catch((error: unknown) => {
      setAviso(error instanceof Error ? error.message : "No se guardó");
    });
  }

  return (
    <Shell cliente={ctx.cliente.nombre} gestionar>
      <h1 className="text-4xl">Administración</h1>
      <p className="mt-2 text-sm text-muted">Solo el contenido de {ctx.cliente.nombre}.</p>
      {aviso ? <p className="mt-3 text-sm text-bad">{aviso}</p> : null}
      <form
        className="mt-6 grid gap-2 border border-line bg-panel p-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          envolver(altaCurso({ data: { titulo, descripcion, categoria: "IA y Desarrollo", nivel: "Inicial", requiredTier: "free" } }));
        }}
      >
        <h2 className="text-xl">Curso</h2>
        <input value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Título" className="h-11 border border-line bg-ink px-3" />
        <textarea value={descripcion} onChange={(event) => setDescripcion(event.target.value)} placeholder="Descripción" className="min-h-20 border border-line bg-ink px-3 py-2" />
        <button type="submit" className="h-11 bg-accent text-sm font-medium text-on-accent">Publicar curso</button>
      </form>
      <form
        className="mt-4 grid gap-2 border border-line bg-panel p-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          envolver(altaLeccion({ data: { cursoId, titulo: leccion, modulo: "Nuevo", videoTipo, videoUrl, muestra: true } }));
        }}
      >
        <h2 className="text-xl">Lección</h2>
        <select value={cursoId} onChange={(event) => setCursoId(event.target.value)} className="h-11 bg-ink px-3 text-sm">
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>{curso.titulo}</option>
          ))}
        </select>
        <input value={leccion} onChange={(event) => setLeccion(event.target.value)} placeholder="Título de la lección" className="h-11 border border-line bg-ink px-3" />
        <select value={videoTipo} onChange={(event) => setVideoTipo(event.target.value as "youtube" | "vimeo" | "mp4")} className="h-11 bg-ink px-3 text-sm">
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="mp4">MP4</option>
        </select>
        <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://" className="h-11 border border-line bg-ink px-3" />
        <button type="submit" className="h-11 text-sm">Añadir lección</button>
      </form>
      <form
        className="mt-4 grid gap-2 border border-line bg-panel p-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          envolver(altaRecurso({ data: { titulo: recurso, descripcion: recurso, tipo: "Guía PDF", requiredTier: "free" } }));
        }}
      >
        <h2 className="text-xl">Recurso</h2>
        <input value={recurso} onChange={(event) => setRecurso(event.target.value)} placeholder="Título" className="h-11 border border-line bg-ink px-3" />
        <button type="submit" className="h-11 text-sm">Añadir recurso</button>
      </form>
    </Shell>
  );
}
