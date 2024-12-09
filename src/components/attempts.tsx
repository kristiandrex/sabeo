import { NUMBER_OF_COLUMNS, NUMBER_OF_ROWS } from "#/constants";
import { cn } from "#/lib/utils";
import { getColorByAttempts } from "#/services/challenge";
import { Challenge } from "#/types/Challenge";

export function Attempts({
  attempts,
  currentAttempt,
  challenge,
}: {
  attempts: string[];
  currentAttempt: string;
  challenge: Challenge;
}) {
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < NUMBER_OF_ROWS; i++) {
    const isCurrentAttempt = i === attempts.length;
    const attempt = isCurrentAttempt ? currentAttempt : attempts[i];
    const columns: React.ReactNode[] = [];

    let colors: string[] = [];

    if (attempt && !isCurrentAttempt) {
      colors = getColorByAttempts({
        attempt,
        challenge: challenge.word,
      });
    }

    for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
      const color = colors[j];

      columns.push(
        <div
          key={j}
          className={cn(
            "box-content flex aspect-square h-7 items-center justify-center border-2 p-2 text-xl uppercase sm:p-4",

            color
          )}
        >
          {attempt ? attempt[j] : ""}
        </div>
      );
    }

    rows.push(
      <div key={i} className="grid grid-cols-5 gap-2">
        {columns}
      </div>
    );
  }

  return <div className="flex flex-col gap-2">{rows}</div>;
}
