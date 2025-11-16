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
        className="max-w-md space-y-3 p-4 text-sm leading-relaxed sm:max-w-lg sm:p-6"
        aria-describedby={undefined}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-semibold sm:text-2xl">
            Instrucciones
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 text-left text-muted-foreground sm:text-base">
          <p>
            Cada reto usa palabras de <strong>5 letras</strong>.
          </p>
          <p>
            <strong>Recibirás una notificación</strong> sorpresa para iniciar el
            reto diario.
          </p>
          <p>
            Tendrás <strong>6 intentos</strong> para descubrirla.
          </p>
          <p>Después de cada intento verás los siguientes colores:</p>
        </div>

        <ul className="space-y-1 text-left text-muted-foreground sm:text-base">
          <li>
            <span className="font-semibold text-emerald-600">
              Verde:
            </span>{" "}
            La letra es correcta y está bien ubicada.
          </li>
          <li>
            <span className="font-semibold text-amber-600">
              Amarillo:
            </span>{" "}
            La letra es correcta pero está en otra posición.
          </li>
          <li>
            <span className="font-semibold text-zinc-600">
              Gris:
            </span>{" "}
            La letra no está en la palabra.
          </li>
        </ul>

        <p className="text-left text-muted-foreground sm:text-base">
          Completa el reto a diario para sumar puntos extra y evita perder más
          de tres días seguidos para no restar puntos.
        </p>
        <p className="text-left text-muted-foreground sm:text-base">
          Si terminas un reto en el primer minuto desde que lo comienzas,
          ganas <strong>+1 punto adicional</strong>.
        </p>

        <div className="rounded-2xl border border-border bg-card p-3 text-left text-sm text-muted-foreground sm:text-base">
          <p className="font-semibold text-foreground">Ejemplo</p>
          <p className="text-sm sm:text-base">
            Si la palabra es <strong>“CASAS”</strong> y escribes{" "}
            <strong>“SALSA”</strong> verás:
          </p>

          <div className="mt-2 flex justify-center space-x-1 text-[11px] font-bold text-white sm:text-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-yellow-500">
              S
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded bg-green-500">
              A
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded bg-gray-500">
              L
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded bg-yellow-500">
              S
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded bg-yellow-500">
              A
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
