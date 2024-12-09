import { Button } from "@radix-ui/themes";
import { useEffect } from "react";

import { cn } from "#/lib/utils";
import { getColorsByAttempt } from "#/services/challenge";

function getClassNamesByColor(color: string) {
  return {
    green: "bg-green-500 hover:bg-green-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    gray: "bg-gray-600 hover:bg-gray-700",
  }[color];
}

function getKeyboardColors({
  attempts,
  challenge,
}: {
  attempts: string[];
  challenge: string;
}) {
  const map: Record<string, string> = {};

  attempts.forEach((attempt) => {
    const colors = getColorsByAttempt({
      attempt,
      challenge,
    });

    attempt.split("").forEach((letter, index) => {
      const color = getClassNamesByColor(colors[index] ?? "");

      if (color) {
        map[letter] = color;
      }
    });
  });

  return map;
}

const keyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export function Keyboard({
  challenge,
  attempts,
  onKeyDown,
}: {
  challenge: string;
  attempts: string[];
  onKeyDown: (key: string) => void;
}) {
  const colors = getKeyboardColors({
    attempts,
    challenge,
  });

  const rows = keyboard.map((row, index) => (
    <KeyboardRow key={index} row={row} colors={colors} onKeyDown={onKeyDown} />
  ));

  useEffect(() => {
    function listener(event: KeyboardEvent) {
      onKeyDown(event.key.toUpperCase());
    }

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [onKeyDown]);

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto sm:gap-2">{rows}</div>
  );
}

function KeyboardRow({
  row,
  colors,
  onKeyDown,
}: {
  row: string[];
  colors: Record<string, string>;
  onKeyDown: (key: string) => void;
}) {
  function onClick(key: string) {
    return () => onKeyDown(key);
  }

  const keys = row.map((key) => (
    <Button
      key={key}
      className={cn("flex-auto p-2 text-center sm:p-4", colors[key])}
      color="gray"
      onClick={onClick(key)}
    >
      {key === "ENTER" ? "✓" : key === "BACKSPACE" ? "←" : key}
    </Button>
  ));

  return <div className="flex gap-1 sm:gap-2">{keys}</div>;
}
