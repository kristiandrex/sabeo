"use client";

import {
  useActionState,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { NUMBER_OF_COLUMNS, NUMBER_OF_ROWS } from "#/constants";
import { Challenge } from "#/types";
import { completeChallenge } from "#/app/actions/challenge";
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
  const [state, action, isPending] = useActionState(
    (prevAttempts: string[], newAttempt: string) => {
      console.log(newAttempt);

      return prevAttempts.concat(newAttempt);
    },
    initialAttempts
  );

  const [attempts, setAttempts] = useState(initialAttempts);

  const [optimisticAttempts, addOptimisticAttempt] = useOptimistic(
    state,
    (prevAttemps, newAttempt: string) => prevAttemps.concat(newAttempt)
  );

  const [currentAttempt, setCurrentAttempt] = useState<string>("");
  const [dialogIsOpened, setDialogIsOpened] = useState(false);

  const colors = getAllAttemptsColors(attempts, challenge.word);

  const isChallengeCompleted =
    (attempts.length === NUMBER_OF_ROWS || attempts.includes(challenge.word)) &&
    !isPending;

  async function addAttempt(attempt: string) {
    addOptimisticAttempt(attempt);

    if (attempt === challenge.word) {
      const response = await completeChallenge();

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.success) {
        toast.success("¡Muy bien, completaste el reto!");
        setDialogIsOpened(true);
      }
    }

    setAttempts((value) => value.concat(attempt));
  }

  function onKeyDown(key: string) {
    if (isChallengeCompleted) {
      return;
    }

    const isLetter = /^[A-Z]$/.test(key);

    const wordIsCompleted = currentAttempt.length === NUMBER_OF_COLUMNS;

    if (isLetter && !wordIsCompleted) {
      setCurrentAttempt((value) => value.concat(key));
      return;
    }
    if (key === "BACKSPACE") {
      setCurrentAttempt((value) => value.slice(0, -1));
      return;
    }

    if (key === "ENTER" && !wordIsCompleted) {
      toast.error("El intento debe tener 5 letras");
      return;
    }

    if (key === "ENTER" && wordIsCompleted) {
      addAttempt(currentAttempt);
      setCurrentAttempt("");
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
        attempts={attempts}
        currentAttempt={currentAttempt}
        colors={colors}
      />

      <Keyboard
        challenge={challenge.word}
        attempts={attempts}
        onKeyDown={onKeyDown}
      />
    </main>
  );
}
