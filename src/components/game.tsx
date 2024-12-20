"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { NUMBER_OF_COLUMNS, NUMBER_OF_ROWS } from "#/constants";
import { Challenge } from "#/types";
import { useLocalStorage } from "#/hooks/useLocalStorage";
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

export function Game({ challenge }: { challenge: Challenge }) {
  const [challengeId, setChallengeId] = useLocalStorage(
    "challenge",
    challenge.id
  );

  const [attempts, setAttempts] = useLocalStorage<string[]>("attempts", []);
  const [currentAttempt, setCurrentAttempt] = useState<string>("");
  const [dialogIsOpened, setDialogIsOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  const colors = getAllAttemptsColors(attempts, challenge.word);

  const isChallengeCompleted =
    (attempts.length === NUMBER_OF_ROWS || attempts.includes(challenge.word)) &&
    !isPending;

  async function addAttempt(attempt: string) {
    startTransition(async () => {
      const prevAttempts = attempts;

      setAttempts((prevAttempts) => prevAttempts.concat(attempt));

      if (attempt === challenge.word) {
        const response = await completeChallenge();

        if (response.success) {
          toast.success("¡Muy bien, completaste el reto!");
          setDialogIsOpened(true);
        }

        if (response.error) {
          toast.error(response.error);
          setAttempts(prevAttempts);
        }
      }
    });
  }

  function onKeyDown(key: string) {
    if (isChallengeCompleted) {
      return;
    }

    const isLetter = /^[A-Z]$/.test(key);
    const areAttemptsCompleted = attempts.length === NUMBER_OF_ROWS;
    const wordIsCompleted = currentAttempt.length === NUMBER_OF_COLUMNS;

    if (isLetter && !wordIsCompleted) {
      setCurrentAttempt((value) => value.concat(key));
    } else if (key === "BACKSPACE") {
      setCurrentAttempt((value) => value.slice(0, -1));
    } else if (key === "ENTER" && wordIsCompleted && !areAttemptsCompleted) {
      addAttempt(currentAttempt);
      setCurrentAttempt("");
    }
  }

  useEffect(() => {
    if (challenge.id !== Number(challengeId)) {
      setChallengeId(challenge.id);
      setAttempts([]);
    }
  }, [challenge.id, challengeId, setChallengeId, setAttempts]);

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
