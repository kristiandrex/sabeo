import dayjs from "dayjs";
import { CheckCircle2Icon, CircleIcon } from "lucide-react";

import type { ChallengeHistoryEntry } from "#/domain/challenge/types";
import { cn } from "#/lib/utils";

type HistoryListProps = {
  entries: ChallengeHistoryEntry[];
};

export function HistoryList({ entries }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 px-5 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Aun no has jugado ningun desafio.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
      <div className="flex items-center px-2.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600 sm:px-3 sm:text-xs">
        <span className="w-20 shrink-0 text-left sm:w-24">#</span>
        <span className="flex-1 text-left">Fecha</span>
        <span className="min-w-[5rem] text-right sm:text-left">Estado</span>
      </div>

      {entries.map((entry) => {
        const isCompleted = entry.status === "completed";
        const statusLabel = isCompleted ? "Completado" : "Jugado";
        const StatusIcon = isCompleted ? CheckCircle2Icon : CircleIcon;
        const formattedDate = dayjs(entry.challengeDate).format("DD/MM/YYYY");

        return (
          <article
            key={entry.challengeId}
            className={cn(
              "flex items-center justify-between rounded-2xl border bg-white px-2.5 py-3 shadow-sm transition-colors dark:bg-slate-950/40 sm:rounded-3xl sm:px-5 sm:py-4",
              isCompleted
                ? "border-green-400 bg-green-50/80 dark:border-green-700 dark:bg-green-950/40"
                : "border-yellow-400 bg-yellow-50/80 dark:border-yellow-700 dark:bg-yellow-950/40",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
              <div className="w-20 shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:w-24 sm:text-base">
                #{entry.challengeNumber}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:text-base">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="ml-3 flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:ml-4 sm:gap-2 sm:text-base">
              <StatusIcon
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400",
                )}
                aria-hidden
              />
              <span>{statusLabel}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
