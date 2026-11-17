import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useContexto } from "@/components/use-contexto";

export const Route = createFileRoute("/planes")({ component: Planes });

const PLANES = [
  { id: "free", nombre: "Gratis", detalle: "Catálogo, lecciones de muestra y la comunidad del cliente." },
  { id: "pro", nombre: "Pro", detalle: "Cursos y recursos marcados Pro. El cobro no está conectado." },
  { id: "studio", nombre: "Studio", detalle: "El nivel alto, preparado en el dato. Tampoco se cobra." },
];

function Planes() {
  const { ctx } = useContexto();
  return (
    <Shell cliente={ctx?.cliente.nombre} gestionar={ctx?.usuario?.puedeGestionar}>
      <h1 className="text-4xl">Planes</h1>
      <p className="mt-2 text-sm text-muted">
        Tu plan: {ctx?.usuario?.plan ?? "free"}. No hay pasarela.
      </p>
      <ul className="mt-6 grid gap-px bg-line">
        {PLANES.map((plan) => (
          <li key={plan.id} className="bg-panel px-4 py-5">
            <p className="font-mono text-sm text-accent-2 tabular-nums">{plan.id}</p>
            <h2 className="mt-2 text-2xl">{plan.nombre}</h2>
            <p className="mt-2 text-sm text-muted">{plan.detalle}</p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
