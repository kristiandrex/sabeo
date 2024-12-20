"use client";

import { Dialog } from "@radix-ui/themes";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DialogInstructions({ open, onOpenChange }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="450px" aria-describedby={undefined}>
        <Dialog.Title align={"center"} className="text-2xl mb-2">
          Instrucciones
        </Dialog.Title>

        <p className="mb-2">
          <strong>Recibirás una notificación</strong> sorpresa para iniciar el
          reto diario.
        </p>

        <p className="mb-2">
          Adivina la palabra en <strong>6 intentos</strong>.
        </p>
        <p className="mb-2">
          Después de cada intento verás los siguientes colores:
        </p>

        <ul className="mb-4 space-y-1">
          <li>
            <span className="font-bold text-green-600">Verde:</span> Letra
            correcta y bien ubicada.
          </li>
          <li>
            <span className="font-bold text-yellow-600">Amarillo:</span> Letra
            correcta en otra posición.
          </li>
          <li>
            <span className="font-bold text-gray-600">Gris:</span> Letra no está
            en la palabra.
          </li>
        </ul>

        <div>
          <strong>Ejemplo:</strong>
          <div className="flex space-x-2 mt-2">
            <span className="w-8 h-8 flex items-center justify-center bg-green-500 text-white font-bold rounded">
              C
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white font-bold rounded">
              A
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white font-bold rounded">
              L
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white font-bold rounded">
              M
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white font-bold rounded">
              A
            </span>
          </div>

          <p className="text-sm mt-2">
            <span className="font-bold text-green-600">"C"</span> está en la
            posición correcta.{" "}
            <span className="font-bold text-yellow-600">"A"</span> está en otra
            posición.{" "}
            <span className="font-bold text-gray-600">"L", "M" y "A"</span> no
            están en la palabra.
          </p>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
