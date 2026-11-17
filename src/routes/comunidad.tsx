import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell, Meta } from "@/components/shell";
import { useContexto } from "@/components/use-contexto";
import { obtenerComunidad, obtenerHilo, publicarComentario, publicarPost, votarPost } from "@/lib/estudia/lms-api";

export const Route = createFileRoute("/comunidad")({ component: Comunidad });

const CATEGORIAS = ["Dudas técnicas", "Proyectos y feedback", "Recursos compartidos", "Anuncios"];

function Comunidad() {
  const { ctx } = useContexto();
  const [posts, setPosts] = useState<Awaited<ReturnType<typeof obtenerComunidad>>["posts"]>([]);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Awaited<ReturnType<typeof obtenerHilo>>["comentarios"]>([]);
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [filtro, setFiltro] = useState("Todas");
  const [nota, setNota] = useState("");
  const [comentario, setComentario] = useState("");
  const visibles = filtro === "Todas" ? posts : posts.filter((post) => post.categoria === filtro);

  function cargar() {
    return obtenerComunidad().then((data) => setPosts(data.posts));
  }

  useEffect(() => {
    if (!ctx) return;
    void cargar();
  }, [ctx?.cliente.id]);

  useEffect(() => {
    if (!abierto) return;
    void obtenerHilo({ data: abierto }).then((data) => setComentarios(data.comentarios));
  }, [abierto]);

  function publicar(event: FormEvent) {
    event.preventDefault();
    if (!ctx?.usuario) {
      setNota("Entra para publicar.");
      return;
    }
    void publicarPost({ data: { titulo, cuerpo, categoria } })
      .then(() => {
        setTitulo("");
        setCuerpo("");
        return cargar();
      })
      .catch((error: unknown) => setNota(error instanceof Error ? error.message : "No se publicó"));
  }

  return (
    <Shell cliente={ctx?.cliente.nombre} gestionar={ctx?.usuario?.puedeGestionar}>
      <h1 className="text-4xl">Comunidad</h1>
      <p className="mt-2 text-sm text-muted">Solo las voces de este cliente.</p>
      <form onSubmit={publicar} className="mt-6 grid gap-2 border border-line bg-panel p-4">
        <select value={categoria} onChange={(event) => setCategoria(event.target.value)} className="h-11 bg-ink px-3 text-sm">
          {CATEGORIAS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Título" className="h-11 border border-line bg-ink px-3" />
        <textarea value={cuerpo} onChange={(event) => setCuerpo(event.target.value)} placeholder="Texto" className="min-h-24 border border-line bg-ink px-3 py-2" />
        <button type="submit" className="h-11 bg-accent text-sm font-medium text-on-accent">Publicar</button>
        {nota ? <p className="text-sm text-muted">{nota}</p> : null}
      </form>
      <div className="mt-6 flex gap-4 overflow-x-auto text-sm">
        {["Todas", ...CATEGORIAS].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFiltro(item)}
            className={"h-11 shrink-0 " + (filtro === item ? "text-paper" : "text-muted")}
          >
            {item}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-px bg-line">
        {visibles.map((post) => (
          <li key={post.id} className="bg-panel px-4 py-4">
            <Meta partes={[post.categoria, post.autorNombre, `${post.likes} útiles`]} />
            <h2 className="mt-2 text-xl">{post.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{post.cuerpo}</p>
            <div className="mt-3 flex gap-4">
              <button
                type="button"
                className="h-11 text-sm text-accent-2"
                onClick={() => {
                  if (!ctx?.usuario) {
                    setNota("Entra para votar.");
                    return;
                  }
                  void votarPost({ data: post.id }).then(() => cargar());
                }}
              >
                Útil
              </button>
              <button type="button" className="h-11 text-sm text-muted" onClick={() => setAbierto(post.id)}>
                Comentarios
              </button>
            </div>
            {abierto === post.id ? (
              <div className="mt-3 grid gap-3">
                {comentarios.map((item) => (
                  <p key={item.id} className="text-sm">
                    <span className="text-paper">{item.autorNombre}</span>
                    <span className="text-muted"> · {item.cuerpo}</span>
                  </p>
                ))}
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!ctx?.usuario) return;
                    void publicarComentario({ data: { postId: post.id, cuerpo: comentario } }).then(() => {
                      setComentario("");
                      return obtenerHilo({ data: post.id }).then((data) => setComentarios(data.comentarios));
                    });
                  }}
                >
                  <input value={comentario} onChange={(event) => setComentario(event.target.value)} className="h-11 flex-1 border border-line bg-ink px-3" />
                  <button type="submit" className="h-11 px-3 text-sm">Enviar</button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Shell>
  );
}
