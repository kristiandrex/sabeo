"use client";

import { Button } from "@radix-ui/themes";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-2">
      <h1 className="text-2xl">Ocurrió un error</h1>
      <Button onClick={reset}>Volver a cargar</Button>
    </div>
  );
}
