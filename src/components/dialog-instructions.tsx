"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DialogInstructions({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="mb-4 text-2xl">Instrucciones</DialogTitle>
        </DialogHeader>

        <p className="mb-2">
          Ahora habrá palabras de <strong>5 o 6 letras</strong> en el reto.
        </p>

        <p className="mb-2">
          <strong>Recibirás una notificación</strong> sorpresa para iniciar el
          reto diario.
        </p>

        <p className="mb-2">
          Tendrás <strong>6 intentos</strong> para descubrir la palabra.
        </p>

        <p className="mb-2">
          Después de cada intento verás los siguientes colores:
        </p>

        <ul className="mb-4 space-y-1">
          <li>
            <span className="font-bold text-green-600">Verde:</span> Si la letra
            es correcta y está bien ubicada.
          </li>
          <li>
            <span className="font-bold text-yellow-600">Amarillo:</span> Si la
            letra es correcta pero está en otra posición.
          </li>
          <li>
            <span className="font-bold text-gray-600">Gris:</span> Si la letra
            no está en la palabra.
          </li>
        </ul>

        <div>
          <strong>Ejemplo:</strong>

          <p>
            Si la palabra es <strong>&quot;CASAS&quot;</strong> y escribes{" "}
            <strong>&quot;SALSA&quot;</strong> verás:
          </p>

          <div className="flex space-x-2 mt-2">
            <span className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white font-bold rounded">
              S
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-green-500 text-white font-bold rounded">
              A
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white font-bold rounded">
              L
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white font-bold rounded">
              S
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white font-bold rounded">
              A
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
