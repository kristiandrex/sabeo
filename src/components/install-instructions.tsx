import { Button } from "@radix-ui/themes";
import { EllipsisVerticalIcon, ShareIcon, SmartphoneIcon } from "lucide-react";

type InstallInstructionsProps = {
  platform: "ios" | "android";
  onSkip: () => void;
};

const stepsByPlatform: Record<
  InstallInstructionsProps["platform"],
  {
    key: string;
    text: string;
    icon?: "share" | "ellipsis";
  }[]
> = {
  ios: [
    {
      key: "ios-share",
      text: "Para instalar la app haz click en el botón",
      icon: "share",
    },
    {
      key: "ios-add-to-home",
      text: 'Luego selecciona "Agregar a la pantalla de inicio" e instala la app.',
    },
    {
      key: "ios-open-app",
      text: "Abre Sabeo desde tu pantalla de inicio y vuelve a presionar 'Activar notificaciones'.",
    },
  ],
  android: [
    {
      key: "android-menu",
      text: "Para instalar la app haz click en el botón",
      icon: "ellipsis",
    },
    {
      key: "android-add-to-home",
      text: 'Luego selecciona "Agregar a la pantalla de inicio" e instala la app.',
    },
    {
      key: "android-open-app",
      text: "Abre Sabeo desde tu pantalla de inicio y vuelve a presionar 'Activar notificaciones'.",
    },
  ],
};

export function InstallInstructions({
  platform,
  onSkip,
}: InstallInstructionsProps) {
  const steps = stepsByPlatform[platform];

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-600">
          <SmartphoneIcon className="h-10 w-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Instala Sabeo</h1>
          <p className="text-gray-600 text-pretty">
            Para recibir notificaciones, instala la app en tu dispositivo
          </p>
        </div>
      </div>

      <ol className="flex w-full flex-col gap-4 text-left">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-start gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold">
              {index + 1}
            </span>
            <span className="text-gray-700">
              {step.icon === "share" ? (
                <>
                  {step.text}{" "}
                  <ShareIcon
                    className="mx-1 inline h-4 w-4 align-middle text-green-600"
                    aria-hidden="true"
                  />
                </>
              ) : step.icon === "ellipsis" ? (
                <>
                  {step.text}{" "}
                  <EllipsisVerticalIcon
                    className="mx-1 inline h-4 w-4 align-middle text-green-600"
                    aria-hidden="true"
                  />
                </>
              ) : (
                step.text
              )}
            </span>
          </li>
        ))}
      </ol>

      <Button
        variant="outline"
        className="h-12 w-full max-w-sm text-base font-semibold"
        onClick={onSkip}
      >
        Continuar sin notificaciones
      </Button>
    </div>
  );
}
