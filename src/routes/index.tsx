import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Meta } from "@/components/shell";
import { useContexto } from "@/components/use-contexto";
import { obtenerAula } from "@/lib/estudia/lms-api";

export const Route = createFileRoute("/")({ component: Classroom });

function Classroom() {
  const { ctx, error } = useContexto();
  const [cursos, setCursos] = useState<Awaited<ReturnType<typeof obtenerAula>>["cursos"]>([]);
  const [listo, setListo] = useState(false);
  const [categoria, setCategoria] = useState("Todas");
  const [nivel, setNivel] = useState("Todos");

  useEffect(() => {
    if (!ctx) return;
    setListo(false);
    void obtenerAula().then((aula) => {
      setCursos(aula.cursos);
      setListo(true);
    });
  }, [ctx?.cliente.id]);

  const categorias = ["Todas", ...new Set(cursos.map((curso) => curso.categoria))];
  const niveles = ["Todos", ...new Set(cursos.map((curso) => curso.nivel))];
  const visibles = cursos.filter(
    (curso) =>
      (categoria === "Todas" || curso.categoria === categoria) &&
      (nivel === "Todos" || curso.nivel === nivel),
  );

  return (
    <Shell cliente={ctx?.cliente.nombre} gestionar={ctx?.usuario?.puedeGestionar}>
      <h1 className="text-4xl">Classroom</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Cursos de este cliente. La primera lección marcada como muestra se ve sin cuenta.
      </p>
      {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}
      <div className="mt-6 flex gap-4 overflow-x-auto text-sm">
        {categorias.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategoria(item)}
            className={"h-11 shrink-0 " + (categoria === item ? "text-paper" : "text-muted")}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-1 flex gap-4 overflow-x-auto text-sm">
        {niveles.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setNivel(item)}
            className={"h-11 shrink-0 " + (nivel === item ? "text-paper" : "text-muted")}
          >
            {item}
          </button>
        ))}
      </div>
      {!ctx || !listo ? <p className="mt-6 text-sm text-muted">Cargando el aula</p> : null}
      {listo && visibles.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Este cliente no tiene cursos con ese filtro.</p>
      ) : null}
      <ul className="mt-6 grid gap-px bg-line">
        {visibles.map((curso) => (
          <li key={curso.id} className="bg-panel px-4 py-5">
            <Meta partes={[curso.categoria, curso.nivel, curso.requiredTier, `${curso.duracionMin} min`]} />
            <h2 className="mt-2 text-2xl">{curso.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{curso.descripcion}</p>
            <Link to="/curso/$cursoId" params={{ cursoId: curso.id }} className="mt-4 inline-flex h-11 items-center text-sm text-accent-2">
              Abrir temario
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
