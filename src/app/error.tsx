"use client";

import { Button } from "#/components/ui/button";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl">Ocurrió un error</h1>
      <Button onClick={reset}>Volver a cargar</Button>
    </div>
  );
}
