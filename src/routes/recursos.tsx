import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell, Meta } from "@/components/shell";
import { useContexto } from "@/components/use-contexto";
import { obtenerRecursos } from "@/lib/estudia/lms-api";

export const Route = createFileRoute("/recursos")({ component: Recursos });

function Recursos() {
  const { ctx } = useContexto();
  const [recursos, setRecursos] = useState<Awaited<ReturnType<typeof obtenerRecursos>>["recursos"]>([]);

  useEffect(() => {
    if (!ctx) return;
    void obtenerRecursos().then((data) => setRecursos(data.recursos));
  }, [ctx?.cliente.id]);

  return (
    <Shell cliente={ctx?.cliente.nombre} gestionar={ctx?.usuario?.puedeGestionar}>
      <h1 className="text-4xl">Recursos</h1>
      <p className="mt-2 text-sm text-muted">Lo descargable de este cliente. Sin pasarela.</p>
      <ul className="mt-6 grid gap-px bg-line">
        {recursos.map((recurso) => (
          <li key={recurso.id} className="bg-panel px-4 py-5">
            <Meta partes={[recurso.tipo, recurso.requiredTier]} />
            <h2 className="mt-2 text-xl">{recurso.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{recurso.descripcion}</p>
            {recurso.abierto && recurso.url ? (
              <a href={recurso.url} className="mt-3 inline-flex h-11 items-center text-sm text-accent-2" target="_blank" rel="noreferrer">
                Abrir
              </a>
            ) : recurso.abierto ? (
              <p className="mt-3 text-sm text-good">Disponible en tu plan.</p>
            ) : (
              <p className="mt-3 text-sm text-muted">Pide plan {recurso.requiredTier}. El cobro no está activo.</p>
            )}
          </li>
        ))}
      </ul>
    </Shell>
  );
}
