import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SignInGate } from "@/lib/auth/gates";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-lg place-items-center px-5">
      <SignInGate
        fallback={
          <div className="grid w-full gap-3">
            <h1 className="font-display text-3xl text-paper">Entrar</h1>
            {GROK_PROVIDERS.map((proveedor) => (
              <button
                key={proveedor.providerId}
                type="button"
                onClick={() => signIn(proveedor.providerId, { callbackURL: "/" })}
                className="h-11 bg-accent px-4 font-medium text-on-accent"
              >
                Continuar con {proveedor.label}
              </button>
            ))}
          </div>
        }
      >
        <Navigate to="/" />
      </SignInGate>
    </main>
  );
}
