import { useEffect, useState } from "react";

export function PwaRegistrar() {
  const [estado, setEstado] = useState("Comprobando");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setEstado("Este navegador no registra service workers");
      return;
    }
    let cancelado = false;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        if (!cancelado) setEstado("Service worker activo");
      })
      .catch(() => {
        if (!cancelado) setEstado("No se pudo registrar el service worker");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <p className="text-sm text-muted">
      Manifest propio, pantalla completa, iconos 192 y 512. {estado}.
    </p>
  );
}
