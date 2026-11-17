import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useContexto } from "@/components/use-contexto";
import { obtenerRanking } from "@/lib/estudia/lms-api";

export const Route = createFileRoute("/ranking")({ component: Ranking });

function Ranking() {
  const { ctx } = useContexto();
  const [perfiles, setPerfiles] = useState<Awaited<ReturnType<typeof obtenerRanking>>["perfiles"]>([]);

  useEffect(() => {
    if (!ctx) return;
    void obtenerRanking().then((data) => setPerfiles(data.perfiles));
  }, [ctx?.cliente.id]);

  return (
    <Shell cliente={ctx?.cliente.nombre} gestionar={ctx?.usuario?.puedeGestionar}>
      <h1 className="text-4xl">Ranking</h1>
      <p className="mt-2 text-sm text-muted">XP de este cliente. Sin correos.</p>
      <ol className="mt-6">
        {perfiles.map((perfil, indice) => (
          <li key={perfil.userId} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
            <div>
              <p className="font-mono text-sm text-muted tabular-nums">{String(indice + 1).padStart(2, "0")}</p>
              <p className="text-lg">{perfil.nombre}</p>
              <p className="text-sm text-muted">
                {perfil.titular} · {perfil.especialidad} · {perfil.leccionesHechas} lecciones
              </p>
            </div>
            <p className="font-mono text-lg tabular-nums">{perfil.xp} XP</p>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
