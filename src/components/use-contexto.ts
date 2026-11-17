import { useCallback, useEffect, useState } from "react";
import { obtenerContexto } from "@/lib/estudia/lms-api";

export type ContextoEstudia = Awaited<ReturnType<typeof obtenerContexto>>;

export function useContexto() {
  const [ctx, setCtx] = useState<ContextoEstudia | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    return obtenerContexto()
      .then((siguiente) => {
        setCtx(siguiente);
        setError(null);
      })
      .catch((causa: unknown) => {
        setError(causa instanceof Error ? causa.message : "No se pudo cargar");
      });
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { ctx, error, cargar };
}
