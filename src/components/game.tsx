"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import Confetti from "react-confetti";

import { Challenge } from "#/types";
import { addAttempt, completeChallenge } from "#/app/actions/challenge";
import { getColorsByAttempt } from "#/utils/challenge";

import { Attempts } from "./attempts";
import { Keyboard } from "./keyboard";
import { DialogChallengeCompleted } from "./dialog-completed";
import { useWindowSize } from "react-use";
import { NUMBER_OF_ROWS } from "#/constants";

function getAllAttemptsColors(attempts: string[], challenge: string) {
  return attempts.map((attempt) => getColorsByAttempt({ attempt, challenge }));
}

type Props = {
  challenge: Challenge;
  initialAttempts: string[];
  challengeIsFinished: boolean;
  onFinishChallenge: () => Promise<void>;
};

export function Game({
  challenge,
  initialAttempts,
  challengeIsFinished,
  onFinishChallenge,
}: Props) {
  const [attempts, setAttempts] = useState(initialAttempts);
  const [currentAttempt, setCurrentAttempt] = useState<string>("");
  const [challengeIsCompleted, setChallengeIsCompleted] = useState(false);

  const [optimisticAttempts, addOptimisticAttempt] = useOptimistic(
    attempts,
    (currentAttempts, newAttempt: string) => currentAttempts.concat(newAttempt)
  );

  const [optimisticCurrent, setOptimisticCurrent] = useOptimistic(
    currentAttempt,
    (currentAttempt, newAttempt: string) => newAttempt
  );

  const [isPending, startTransition] = useTransition();
  const { height, width } = useWindowSize();

  const colors = getAllAttemptsColors(optimisticAttempts, challenge.word);

  async function addAttemptAction(attempt: string) {
    toast.dismiss();
    toast.info("Guardando intento...");

    startTransition(() => {
      addOptimisticAttempt(attempt);
      setOptimisticCurrent("");
    });

    const { success } = await addAttempt(attempt, challenge.id);

    if (!success) {
      toast.dismiss();
      toast.error("No se pudo guardar tu intento");
      return;
    }

    toast.dismiss();

    if (attempt !== challenge.word) {
      toast.success("Intento guardado");
    } else {
      const response = await completeChallenge();

      if (!response.success) {
        toast.dismiss();
        toast.error(response.error);
        return;
      }

      setChallengeIsCompleted(true);
    }

    startTransition(() => {
      setAttempts((value) => value.concat(attempt));
      setCurrentAttempt("");
    });

    if (attempt === challenge.word || attempts.length === NUMBER_OF_ROWS - 1) {
      await onFinishChallenge();
    }
  }

  function onKeyDown(key: string) {
    if (challengeIsFinished || isPending) {
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
      toast.error("El intento debe tener 5 o 6 letras");
      return;
    }

    if (key === "ENTER" && wordIsCompleted) {
      addAttemptAction(optimisticCurrent);
    }
  }

  return (
    <main className="flex h-full flex-col items-center justify-between gap-4">
      <Confetti
        width={width}
        height={height}
        run={challengeIsCompleted}
        recycle={false}
      />
      <DialogChallengeCompleted
        key={challengeIsFinished.toString()}
        challenge={challenge}
        colors={colors}
        defaultOpen={challengeIsFinished}
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
