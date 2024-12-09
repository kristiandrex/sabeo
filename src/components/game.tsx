"use client";

import { useCallback, useState } from "react";

import { NUMBER_OF_COLUMNS, NUMBER_OF_ROWS } from "#/constants";
import { Challenge } from "#/types/Challenge";

import { Attempts } from "./attempts";
import { Keyboard } from "./keyboard";

export function Game(props: { challenge: Challenge }) {
  const [attempts, setAttempts] = useState<string[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<string>("");

  const addAttempt = useCallback(function addAttempt(attempt: string) {
    setAttempts((prevAttempts) => prevAttempts.concat(attempt));
  }, []);

  const onKeyDown = useCallback(
    function onKeyDown(key: string) {
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
    },
    [attempts.length, currentAttempt, addAttempt]
  );

  return (
    <div className="flex h-screen flex-col items-center justify-between gap-4 p-2 sm:p-4">
      <Attempts
        attempts={attempts}
        currentAttempt={currentAttempt}
        challenge={props.challenge.word}
      />
      <Keyboard
        challenge={props.challenge.word}
        attempts={attempts}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
