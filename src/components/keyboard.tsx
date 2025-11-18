import { useEffect } from "react";

import { cn } from "#/lib/utils";
import { getColorsByAttempt } from "#/domain/challenge/colors";
import { Button } from "#/components/ui/button";

function getClassNamesByColor(color: string) {
  return {
    green: "bg-green-500 hover:bg-green-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    gray: "bg-gray-500 hover:bg-gray-600",
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

type KeyboardKey =
  | string
  | {
      value: string;
      label?: string;
      variant?: "letter" | "confirm" | "backspace";
    };

type KeyboardRowConfig = {
  id: string;
  className: string;
  keys: KeyboardKey[];
};

const keyboardRows: KeyboardRowConfig[] = [
  {
    id: "row-0",
    className: "flex w-full gap-1 px-1 sm:gap-1.5 sm:px-1.5",
    keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  },
  {
    id: "row-1",
    className: "flex w-full justify-center gap-1 px-3 sm:gap-1.5 sm:px-4",
    keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  },
  {
    id: "row-2",
    className: "flex w-full gap-1 px-1 sm:gap-1.5 sm:px-1",
    keys: [
      { label: "✓", value: "ENTER", variant: "confirm" },
      "Z",
      "X",
      "C",
      "V",
      "B",
      "N",
      "M",
      { label: "←", value: "BACKSPACE", variant: "backspace" },
    ],
  },
];

function normalizeKey(key: KeyboardKey) {
  if (typeof key === "string") {
    return { value: key, label: key, variant: "letter" as const };
  }

  return {
    value: key.value,
    label: key.label ?? key.value,
    variant: key.variant ?? ("letter" as const),
  };
}

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

  const rows = keyboardRows.map((row) => (
    <KeyboardRow key={row.id} row={row} colors={colors} onKeyDown={onKeyDown} />
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
    <div className="flex w-full flex-col gap-1 md:max-w-[520px] md:self-center md:gap-1.5">
      {rows}
    </div>
  );
}

function KeyboardRow({
  row,
  colors,
  onKeyDown,
}: {
  row: KeyboardRowConfig;
  colors: Record<string, string>;
  onKeyDown: (key: string) => void;
}) {
  function onClick(key: string) {
    return () => onKeyDown(key);
  }

  const baseKeyClass = cn(
    "min-w-0 rounded-md border border-transparent bg-gray-400",
    "text-center text-base font-semibold text-white md:text-lg",
    "transition-colors hover:bg-gray-500 hover:text-white",
    "h-auto px-0"
  );

  const variantClass = {
    letter:
      "flex-1 basis-0 px-1.5 py-2 sm:px-2.5 sm:py-3 md:px-3 md:py-3.5 md:text-base",
    confirm:
      "flex-none basis-[2.75rem] px-2 py-2 text-sm sm:basis-[3.25rem] sm:py-3 sm:text-base md:basis-[3.5rem] md:py-3 md:text-base",
    backspace:
      "flex-none basis-[2.75rem] px-2 py-2 text-sm sm:basis-[3.25rem] sm:py-3 sm:text-base md:basis-[3.5rem] md:py-3 md:text-base",
  };

  const keys = row.keys.map((keyConfig) => {
    const key = normalizeKey(keyConfig);

    return (
      <Button
        key={key.value}
        className={cn(
          baseKeyClass,
          variantClass[key.variant],
          colors[key.value]
        )}
        variant="ghost"
        onClick={onClick(key.value)}
      >
        {key.label}
      </Button>
    );
  });

  return <div className={row.className}>{keys}</div>;
}
