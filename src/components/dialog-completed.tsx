import { Flame, Zap } from "lucide-react";
import { toast } from "sonner";

import { Challenge, Color } from "#/domain/challenge/types";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { getAppBaseUrl } from "#/lib/env";

type Props = {
  challenge: Challenge;
  colors: Color[][];
  defaultOpen: boolean;
  seasonPoints?: number;
  currentStreak?: number;
  fastBonusAwarded?: boolean;
};

export function DialogChallengeCompleted({
  challenge,
  colors,
  defaultOpen,
  seasonPoints,
  currentStreak,
  fastBonusAwarded,
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

    text += `Inténtalo en ${getAppBaseUrl()}`;

    return text;
  }

  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogContent
        className="w-full max-w-[300px] space-y-2.5 p-3 sm:max-w-lg sm:p-6 sm:space-y-4"
        aria-describedby={undefined}
      >
        <div className="mx-auto w-full max-w-[300px] space-y-2.5 sm:max-w-sm sm:space-y-3">
          <DialogHeader className="space-y-1.5 text-center">
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:text-base">
              La palabra es:
            </p>
            <DialogTitle className="text-center text-3xl font-black tracking-normal sm:text-4xl">
              {challenge.word}
            </DialogTitle>

            {challenge.description && (
              <p className="text-sm leading-relaxed text-muted-foreground text-balance sm:text-base sm:text-center">
                {challenge.description}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-1.5 py-2 sm:py-3">
            {colors.map((row, index) => (
              <ColorSquaresRow key={index} colors={row} />
            ))}
          </div>

          {typeof seasonPoints === "number" && (
            <section className="rounded-2xl border border-border bg-card px-3 py-3 text-center shadow-[0_12px_30px_rgba(7,43,23,0.04)] dark:shadow-none sm:rounded-3xl sm:px-4 sm:py-5">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground sm:text-xs">
                Tus puntos totales
              </p>
              <p className="text-3xl font-black text-foreground sm:text-4xl">
                {seasonPoints}
              </p>

              <div className="my-3 h-px w-full bg-border sm:my-4" />

              {(currentStreak ?? 0) > 1 || fastBonusAwarded ? (
                <ul className="space-y-1.5 text-left text-xs font-medium sm:text-sm">
                  {(currentStreak ?? 0) > 1 && (
                    <li className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-200">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow-inner dark:bg-emerald-950 sm:h-8 sm:w-8">
                        <Flame
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          aria-hidden
                        />
                      </span>
                      <span>Bonus de racha (+1)</span>
                    </li>
                  )}
                  {fastBonusAwarded && (
                    <li className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-3 py-2 text-amber-700 dark:text-amber-200">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-amber-600 shadow-inner dark:bg-amber-950 sm:h-8 sm:w-8">
                        <Zap
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          aria-hidden
                        />
                      </span>
                      <span>Bonus por primer minuto (+1)</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  Completa el reto diario para mantener tus bonus activos.
                </p>
              )}
            </section>
          )}

          <Button
            className="h-11 w-full text-sm font-semibold sm:h-12 sm:text-base"
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
    <div className="flex justify-center gap-1 text-lg leading-none sm:text-2xl">
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
