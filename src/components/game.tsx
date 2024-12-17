"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Dialog, Flex } from "@radix-ui/themes";
import { toast } from "sonner";

import { NUMBER_OF_COLUMNS, NUMBER_OF_ROWS } from "#/constants";
import { Challenge, Color } from "#/types";
import { useLocalStorage } from "#/hooks/useLocalStorage";
import { completeChallenge } from "#/app/actions/challenge";

import { Attempts } from "./attempts";
import { Keyboard } from "./keyboard";
import { getColorsByAttempt } from "#/utils/challenge";

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

  async function share() {
    const canShare =
      typeof navigator.canShare === "function" && navigator.canShare();

    if (!canShare) {
      const text = getTextToShare();
      await navigator.clipboard.writeText(text);
      toast.success("Se copió tu resultado al portapapeles");
      return;
    }

    await navigator.share({
      title: "Reto del dia en Sabeo",
      text: getTextToShare(),
      url: "https://sabeo.vercel.app/",
    });
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
    <div className="flex h-screen flex-col items-center justify-between gap-4 p-2 sm:p-4">
      <Dialog.Root open={dialogIsOpened} onOpenChange={setDialogIsOpened}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title align={"center"}>Reto del día</Dialog.Title>

          <Dialog.Description align={"center"} mb={"4"}>
            La palabra es: {challenge.word}
          </Dialog.Description>

          <Flex direction="column">
            {colors.map((row, index) => (
              <ColorSquaresRow key={index} colors={row} />
            ))}
          </Flex>

          <Flex justify={"center"} mt={"4"}>
            <Button className="bg-green-500 hover:bg-green-600" onClick={share}>
              Compartir
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

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
    </div>
  );
}

function ColorSquaresRow({ colors }: { colors: Color[] }) {
  return (
    <Flex justify={"center"}>
      {colors.map((color) => {
        if (color === "green") {
          return "🟩";
        }

        if (color === "yellow") {
          return "🟨";
        }

        return "⬜";
      })}
    </Flex>
  );
}
