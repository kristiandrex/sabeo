import { Tabs } from "@radix-ui/themes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { getDailyRanking, getRanking } from "#/queries/ranking";
import { createClient } from "#/lib/supabase/server";
import { RankingList } from "#/components/ranking-list";

dayjs.extend(duration);

function formatSeconds(seconds: number) {
  return dayjs.duration(seconds, "seconds").format("HH:mm:ss");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RankingPage() {
  const ranking = await getRanking();
  const dailyRanking = await getDailyRanking();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  return (
    <main className="grow overflow-y-auto px-1 pb-8 pt-2 sm:px-0
        [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-green-200/[.35]
      [&::-webkit-scrollbar-thumb]:bg-green-700/[.75]
      dark:[&::-webkit-scrollbar-track]:bg-green-800/[.45]
      dark:[&::-webkit-scrollbar-thumb]:bg-green-700/[.8]">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 sm:gap-6">
        <header>
          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            Ranking
          </h2>
        </header>

        <Tabs.Root defaultValue="general">
          <Tabs.List className="flex border-b border-zinc-200 text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <Tabs.Trigger
              value="general"
              className="flex-1 border-b-2 border-transparent px-3 py-2 text-center transition-colors data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:data-[state=active]:border-green-500 dark:data-[state=active]:text-green-400"
            >
              General
            </Tabs.Trigger>
            <Tabs.Trigger
              value="daily"
              className="flex-1 border-b-2 border-transparent px-3 py-2 text-center transition-colors data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:data-[state=active]:border-green-500 dark:data-[state=active]:text-green-400"
            >
              Diario
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="general">
            <RankingList
              positions={ranking}
              valueLabel="Retos"
              valueFormatter={(position) => position.challenges}
              currentUserId={currentUserId}
            />
          </Tabs.Content>

          <Tabs.Content value="daily">
            <RankingList
              positions={dailyRanking}
              valueLabel="Tiempo"
              valueFormatter={(position) => formatSeconds(position.seconds)}
              currentUserId={currentUserId}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </main>
  );
}
