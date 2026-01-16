"use client";

import { Button } from "#/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <h2>¡Hubo un error!</h2>
        <Button
          onClick={reset}
          className="h-12 px-6 justify-center gap-2 rounded-xl bg-green-600 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          Volver a cargar
        </Button>
      </body>
    </html>
  );
}
