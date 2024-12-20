import { EllipsisVerticalIcon } from "lucide-react";

export function AndroidInstructions() {
  return (
    <div className="flex flex-col justify-center items-center gap-2 text-center text-balance">
      <p>
        Para instalar la app haz click en el botón de Más opciones{" "}
        <EllipsisVerticalIcon className="inline-block" />
      </p>

      <p>
        Luego selecciona &quot;Agregar a la pantalla de inicio&quot; e instala
        la app.
      </p>

      <p>Abre la app y sigue las instrucciones</p>
    </div>
  );
}
