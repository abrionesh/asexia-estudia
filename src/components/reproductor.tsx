import type { FuenteVideo } from "@/lib/estudia/video";

export function Reproductor({ fuente, titulo }: { fuente: FuenteVideo | null; titulo: string }) {
  if (!fuente) {
    return <p className="text-sm text-muted">Esta lección no se reproduce con el plan actual.</p>;
  }
  if (fuente.tipo === "mp4") {
    return <video className="aspect-video w-full bg-ink" controls src={fuente.src} title={titulo} />;
  }
  return (
    <iframe
      className="aspect-video w-full bg-ink"
      src={fuente.src}
      title={titulo}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
