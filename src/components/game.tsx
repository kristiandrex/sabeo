"use client";

import { useEffect, useRef, useState } from "react";
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

  const alreadyClosed = useRef(false);

  const colors = getAllAttemptsColors(attempts, challenge.word);

  const isChallengeCompleted =
    attempts.length === NUMBER_OF_ROWS || attempts.includes(challenge.word);

  async function addAttempt(attempt: string) {
    if (attempt === challenge.word) {
      const response = await completeChallenge();

      if (response.error) {
        toast.error(response.error);
        return;
      }
    }

    setAttempts((prevAttempts) => prevAttempts.concat(attempt));
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
    if (!navigator.canShare()) {
      const text = getTextToShare();
      navigator.clipboard.writeText(text);
      return;
    }

    await navigator.share({
      title: "Reto del dia en Sapiente",
      text: getTextToShare(),
      url: "https://sapiente.vercel.app/",
    });
  }

  function getTextToShare() {
    let text = "Reto del día en Sapiente\n";

    colors.forEach((row) => {
      row.forEach((color) => {
        text += color === "green" ? "🟩" : color === "yellow" ? "🟨" : "⬜";
      });

      text += "\n";
    });

    text += "Inténtalo en https://sapiente.vercel.app/";

    return text;
  }

  useEffect(() => {
    if (challenge.id !== Number(challengeId)) {
      setChallengeId(challenge.id);
      setAttempts([]);
    }
  }, [challenge.id, challengeId, setChallengeId, setAttempts]);

  useEffect(() => {
    if (!alreadyClosed.current && isChallengeCompleted) {
      setDialogIsOpened(isChallengeCompleted);
      alreadyClosed.current = true;
    }
  }, [attempts, challenge.word, isChallengeCompleted]);

  return (
    <div className="flex h-screen flex-col items-center justify-between gap-4 p-2 sm:p-4">
      <Dialog.Root open={dialogIsOpened} onOpenChange={setDialogIsOpened}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title align={"center"}>Reto del día</Dialog.Title>

          <Dialog.Description align={"center"}>
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
