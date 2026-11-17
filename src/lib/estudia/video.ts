export type FuenteVideo =
  | { tipo: "youtube"; src: string }
  | { tipo: "vimeo"; src: string }
  | { tipo: "mp4"; src: string };

const TIERS = { free: 0, pro: 1, studio: 2 } as const;
export type Tier = keyof typeof TIERS;

export function esTier(value: string): value is Tier {
  return value in TIERS;
}

export function alcanzaTier(plan: string, requerido: string): boolean {
  const tiene = esTier(plan) ? TIERS[plan] : 0;
  const pide = esTier(requerido) ? TIERS[requerido] : 0;
  return tiene >= pide;
}

/** Solo https. El tipo lo manda la ficha; la URL se normaliza para el reproductor. */
export function fuenteVideo(tipo: string, url: string): FuenteVideo | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (tipo === "youtube") {
    const id =
      parsed.hostname === "youtu.be"
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v") ?? "";
    if (!/^[\w-]{6,}$/.test(id)) return null;
    return { tipo: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (tipo === "vimeo") {
    const id = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    if (!/^\d+$/.test(id)) return null;
    return { tipo: "vimeo", src: `https://player.vimeo.com/video/${id}` };
  }
  if (tipo === "mp4") return { tipo: "mp4", src: parsed.toString() };
  return null;
}
