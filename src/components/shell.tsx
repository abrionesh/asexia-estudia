import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SignInGate, UserButton } from "@/lib/auth/gates";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BIBLIOTECA_ESTUDIA } from "@/lib/estudia/contrato";
import { PwaRegistrar } from "./pwa-registrar";

const ENLACES = [
  { to: "/", label: "Classroom" },
  { to: "/comunidad", label: "Comunidad" },
  { to: "/recursos", label: "Recursos" },
  { to: "/ranking", label: "Ranking" },
  { to: "/perfil", label: "Perfil" },
  { to: "/planes", label: "Planes" },
  { to: "/admin", label: "Admin" },
] as const;

export function Shell({
  cliente,
  gestionar,
  children,
}: {
  cliente?: string;
  gestionar?: boolean;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { isPending } = useCurrentUserState();

  return (
    <div className="min-h-screen bg-ink text-paper md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-ink-2 md:min-h-screen md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <p className="text-sm text-accent-2">AsexiA</p>
          <p className="font-display text-2xl">EstudIA</p>
          <p className="mt-1 font-mono text-sm text-muted tabular-nums">
            {BIBLIOTECA_ESTUDIA.id}@{BIBLIOTECA_ESTUDIA.version}
          </p>
          {cliente ? <p className="mt-3 text-sm text-paper">{cliente}</p> : null}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:grid md:px-3">
          {ENLACES.filter((enlace) => enlace.to !== "/admin" || gestionar).map((enlace) => {
            const activo = enlace.to === "/" ? path === "/" : path.startsWith(enlace.to);
            return (
              <Link
                key={enlace.to}
                to={enlace.to}
                className={
                  "flex h-11 shrink-0 items-center px-3 text-sm " +
                  (activo ? "text-paper" : "text-muted")
                }
              >
                {enlace.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-line px-5 py-3">
          {isPending ? <div className="h-8 w-24 animate-pulse bg-panel" /> : null}
          <SignInGate
            fallback={
              <div className="flex flex-wrap gap-2">
                {GROK_PROVIDERS.map((proveedor) => (
                  <button
                    key={proveedor.providerId}
                    type="button"
                    onClick={() => signIn(proveedor.providerId, { callbackURL: path })}
                    className="h-11 bg-accent px-4 text-sm font-medium text-on-accent"
                  >
                    {proveedor.label}
                  </button>
                ))}
              </div>
            }
          >
            <UserButton />
          </SignInGate>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">{children}</main>
        <footer className="border-t border-line px-5 py-4">
          <PwaRegistrar />
        </footer>
      </div>
    </div>
  );
}

export function Meta({ partes }: { partes: string[] }) {
  return <p className="font-mono text-sm text-muted tabular-nums">{partes.join(" · ")}</p>;
}
