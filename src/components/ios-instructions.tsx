import { Share } from "lucide-react";

export function IOSInstructions() {
  return (
    <div className="flex flex-col justify-center items-center gap-2 text-center text-balance">
      <p>
        Para recibir notificaciones haz click en el botón de compartir{" "}
        <Share className="inline-block" />
      </p>

      <p>
        Luego selecciona &quot;Agregar a la pantalla de inicio&quot; y sigue las
        instrucciones.
      </p>
    </div>
  );
}
