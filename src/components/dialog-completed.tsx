import { toast } from "sonner";

import { Challenge, Color } from "#/types";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";

type Props = {
  challenge: Challenge;
  colors: Color[][];
  defaultOpen: boolean;
};

export function DialogChallengeCompleted({
  challenge,
  colors,
  defaultOpen,
}: Props) {
  async function copyToClipboard() {
    try {
      const text = getTextToShare();
      await navigator.clipboard.writeText(text);

      toast.dismiss();
      toast.success("Se copió tu resultado");
    } catch (error) {
      console.error(error);

      toast.dismiss();
      toast.error("No se pudo compartir el reto");
    }
  }

  async function share() {
    try {
      if (typeof navigator.share !== "function") {
        copyToClipboard();
        return;
      }

      await navigator.share({
        title: "Sabeo",
        text: getTextToShare(),
      });
    } catch (error) {
      console.error(error);
      copyToClipboard();
    }
  }

  function getTextToShare() {
    let text = "Reto del día en Sabeo\n";

    colors.forEach((row) => {
      row.forEach((color) => {
        text += color === "green" ? "🟩" : color === "yellow" ? "🟨" : "⬜";
      });

      text += "\n";
    });

    text += "Inténtalo en https://sabeo.vercel.app/";

    return text;
  }

  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogContent
        className="max-w-md sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl">
            La palabra es: {challenge.word}
          </DialogTitle>

          {challenge.description && (
            <p className="text-base text-muted-foreground text-balance">
              {challenge.description}
            </p>
          )}
        </DialogHeader>

        <div className="my-4 space-y-2">
          {colors.map((row, index) => (
            <ColorSquaresRow key={index} colors={row} />
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            className="bg-green-500 text-base font-semibold hover:bg-green-600"
            onClick={share}
          >
            Compartir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ColorSquaresRow({ colors }: { colors: Color[] }) {
  return (
    <div className="flex justify-center text-2xl">
      {colors.map((color, index) => {
        if (color === "green") {
          return (
            <span key={`${index}-green`} aria-hidden="true">
              🟩
            </span>
          );
        }

        if (color === "yellow") {
          return (
            <span key={`${index}-yellow`} aria-hidden="true">
              🟨
            </span>
          );
        }

        return (
          <span key={`${index}-gray`} aria-hidden="true">
            ⬜
          </span>
        );
      })}
    </div>
  );
}
