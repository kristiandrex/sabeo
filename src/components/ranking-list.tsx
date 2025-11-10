import type { ReactNode } from "react";

import { cn } from "#/lib/utils";
import { RankingPosition } from "#/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#/components/ui/avatar";

type RankingListProps = {
  positions: RankingPosition[];
  valueLabel: string;
  valueFormatter: (position: RankingPosition) => ReactNode;
  currentUserId: string | null;
};

export function RankingList({
  positions,
  valueLabel,
  valueFormatter,
  currentUserId,
}: RankingListProps) {
  if (positions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 px-5 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Aún no hay posiciones registradas.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
      <div className="flex items-center px-2.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600 sm:px-3 sm:text-xs">
        <span className="w-9 shrink-0 text-center sm:w-10">#</span>
        <span className="flex-1 text-left">Jugador(a)</span>
        <span className="min-w-[4rem] text-right sm:text-left">{valueLabel}</span>
      </div>

      {positions.map((position, index) => {
        const isCurrentPlayer =
          currentUserId !== null && currentUserId === position.id;

        return (
          <article
            key={position.id}
            className={cn(
              "flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-2.5 py-3 shadow-sm transition-colors dark:border-zinc-800 dark:bg-slate-950/40 sm:rounded-3xl sm:px-5 sm:py-4",
              isCurrentPlayer &&
                "border-green-400 bg-green-50/80 dark:border-green-700 dark:bg-green-950/40",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 sm:h-10 sm:w-10 sm:text-sm",
                  isCurrentPlayer &&
                    "bg-green-500 text-white shadow-[0_6px_14px_rgba(34,197,94,0.35)]",
                )}
              >
                {index + 1}
              </div>

              <Avatar className="h-8 w-8 flex-none sm:h-10 sm:w-10">
                <AvatarImage src={position.picture} alt={position.name} />
                <AvatarFallback>
                  {position.name[0]?.toUpperCase() ?? ""}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 items-center gap-1">
                <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:text-base">
                  {position.name}
                </span>
                {isCurrentPlayer && (
                  <span className="shrink-0 text-xs font-semibold text-green-600 dark:text-green-300 sm:text-sm">
                    (Tú)
                  </span>
                )}
              </div>
            </div>

            <div className="ml-3 shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:ml-4 sm:text-lg">
              {valueFormatter(position)}
            </div>
          </article>
        );
      })}
    </div>
  );
}
