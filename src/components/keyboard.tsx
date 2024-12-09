import { memo, useCallback, useEffect } from "react";
import { Button } from "./ui/button";

const MemoizedButton = memo(Button);

const KEYS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export function Keyboard({
  onKeyDown,
}: {
  attempts: string[];
  onKeyDown: (key: string) => void;
}) {
  const rows: React.ReactNode[] = [];

  const onClick = useCallback(
    function onClick(key: string) {
      return () => onKeyDown(key);
    },
    [onKeyDown]
  );

  for (let i = 0; i < KEYS.length; i++) {
    const row = KEYS[i] ?? [];
    const keys: React.ReactNode[] = [];

    for (let j = 0; j < row.length; j++) {
      const key = row[j] ?? "";

      keys.push(
        <MemoizedButton
          key={key}
          className="flex-auto rounded p-2 text-center sm:p-4"
          onClick={onClick(key)}
        >
          {key === "ENTER" ? "✓" : key === "BACKSPACE" ? "←" : key}
        </MemoizedButton>
      );
    }

    rows.push(
      <div key={i} className="flex gap-1 sm:gap-2">
        {keys}
      </div>
    );
  }

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
