"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { NUMBER_OF_ROWS } from "#/constants";
import { Challenge } from "#/types";
import { addAttempt, completeChallenge } from "#/app/actions/challenge";
import { getColorsByAttempt } from "#/utils/challenge";

import { Attempts } from "./attempts";
import { Keyboard } from "./keyboard";
import { DialogChallengeCompleted } from "./dialog-completed";

function getAllAttemptsColors(attempts: string[], challenge: string) {
  return attempts.map((attempt) =>
    getColorsByAttempt({
      attempt,
      challenge,
    })
  );
}

type Props = {
  challenge: Challenge;
  initialAttempts: string[];
};

export function Game({ challenge, initialAttempts }: Props) {
  const [attempts, setAttempts] = useState(initialAttempts);
  const [currentAttempt, setCurrentAttempt] = useState<string>("");
  const [dialogIsOpened, setDialogIsOpened] = useState(false);

  const [optimisticAttempts, addOptimisticAttempt] = useOptimistic(
    attempts,
    (currentAttempts, newAttempt: string) => currentAttempts.concat(newAttempt)
  );

  const [optimisticCurrent, setOptimisticCurrent] = useOptimistic(
    currentAttempt,
    (currentAttempt, newAttempt: string) => newAttempt
  );

  const [isPending, startTransition] = useTransition();

  const colors = getAllAttemptsColors(optimisticAttempts, challenge.word);

  const isChallengeCompleted =
    (optimisticAttempts.length === NUMBER_OF_ROWS ||
      optimisticAttempts.includes(challenge.word)) &&
    !isPending;

  async function addAttemptAction(attempt: string) {
    toast.dismiss();
    toast.info("Guardando intento...");

    startTransition(async () => {
      addOptimisticAttempt(attempt);
      setOptimisticCurrent("");

      if (attempt === challenge.word) {
        const response = await completeChallenge();

        if (!response.success) {
          toast.dismiss();
          toast.error(response.error);
          return;
        }

        toast.dismiss();
        toast.success("¡Muy bien, completaste el reto!");
        setDialogIsOpened(true);
      }

      const { success } = await addAttempt(attempt, challenge.id);

      if (!success) {
        toast.dismiss();
        toast.error("No se pudo guardar tu intento");
        return;
      }

      toast.dismiss();
      toast.success("Intento guardado");

      startTransition(() => {
        setAttempts((value) => value.concat(attempt));
        setCurrentAttempt("");
      });
    });
  }

  function onKeyDown(key: string) {
    if (isChallengeCompleted) {
      return;
    }

    const isLetter = /^[A-Z]$/.test(key);

    const wordIsCompleted = optimisticCurrent.length === challenge.word.length;

    if (isLetter && !wordIsCompleted) {
      setCurrentAttempt((value) => value.concat(key));
      return;
    }
    if (key === "BACKSPACE") {
      setCurrentAttempt((value) => value.slice(0, -1));
      return;
    }

    if (key === "ENTER" && !wordIsCompleted) {
      toast.dismiss();
      toast.error("El intento debe tener 5 letras");
      return;
    }

    if (key === "ENTER" && wordIsCompleted) {
      addAttemptAction(optimisticCurrent);
    }
  }

  useEffect(
    () => setDialogIsOpened(isChallengeCompleted),
    [isChallengeCompleted]
  );

  return (
    <main className="flex h-full flex-col items-center justify-between gap-4">
      <DialogChallengeCompleted
        challenge={challenge}
        colors={colors}
        open={dialogIsOpened}
        onOpenChange={setDialogIsOpened}
      />

      <Attempts
        attempts={optimisticAttempts}
        currentAttempt={optimisticCurrent}
        colors={colors}
        challenge={challenge.word}
      />

      <Keyboard
        challenge={challenge.word}
        attempts={optimisticAttempts}
        onKeyDown={onKeyDown}
      />
    </main>
  );
}
