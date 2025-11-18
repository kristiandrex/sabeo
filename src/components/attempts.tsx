import { NUMBER_OF_ROWS } from "#/constants";
import { cn } from "#/lib/utils";
import { Color } from "#/domain/challenge/types";

export function getClassNamesByColor(color: string) {
  const classNames: Record<string, string> = {
    green: "bg-green-500 border-green-500 text-white",
    yellow: "bg-yellow-500 border-yellow-500 text-white",
    gray: "bg-gray-500 border-gray-500 text-white",
  };

  return classNames[color];
}

export function Attempts({
  attempts,
  currentAttempt,
  colors,
  challenge,
}: {
  attempts: string[];
  currentAttempt: string;
  colors: Color[][];
  challenge: string;
}) {
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < NUMBER_OF_ROWS; i++) {
    const isCurrentAttempt = i === attempts.length;
    const attempt = isCurrentAttempt ? currentAttempt : attempts[i];

    const columns: React.ReactNode[] = [];
    const attemptColors = colors[i] ?? [];

    for (let j = 0; j < challenge.length; j++) {
      const color = attemptColors[j] ?? "";

      columns.push(
        <div
          key={j}
          className={cn(
            "box-content flex aspect-square h-7 items-center justify-center border-2  p-2 text-xl uppercase sm:p-4",
            getClassNamesByColor(color)
          )}
        >
          {attempt ? attempt[j] : ""}
        </div>
      );
    }

    rows.push(
      <div
        key={i}
        className={cn(
          "grid gap-2",
          challenge.length === 5 ? "grid-cols-5" : "grid-cols-6"
        )}
      >
        {columns}
      </div>
    );
  }

  return <div className="flex flex-col gap-2">{rows}</div>;
}
