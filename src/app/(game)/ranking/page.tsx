import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { getDailyRanking, getRanking } from "#/domain/ranking/queries";
import { createClient } from "#/lib/supabase/server";
import { RankingList } from "#/components/ranking-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";

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
    <main
      className="grow overflow-y-auto px-1 pb-8 pt-2 sm:px-0
        [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-green-200/[.35]
      [&::-webkit-scrollbar-thumb]:bg-green-700/[.75]
      dark:[&::-webkit-scrollbar-track]:bg-green-800/[.45]
      dark:[&::-webkit-scrollbar-thumb]:bg-green-700/[.8]"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 sm:gap-6">
        <header>
          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Ranking</h2>
        </header>

        <Tabs defaultValue="general">
          <TabsList className="flex border-b border-zinc-200 bg-transparent p-0 text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 rounded-none">
            <TabsTrigger
              value="general"
              className="flex-1 border-b-2 border-transparent px-3 py-2 text-center transition-colors rounded-none data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:data-[state=active]:border-green-500 dark:data-[state=active]:text-green-400"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="flex-1 border-b-2 border-transparent px-3 py-2 text-center transition-colors rounded-none data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:data-[state=active]:border-green-500 dark:data-[state=active]:text-green-400"
            >
              Diario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <RankingList
              positions={ranking}
              valueLabel="Puntos"
              valueFormatter={(position) => position.seasonPoints}
              currentUserId={currentUserId}
            />
          </TabsContent>

          <TabsContent value="daily">
            <RankingList
              positions={dailyRanking}
              valueLabel="Tiempo"
              valueFormatter={(position) => formatSeconds(position.seconds)}
              currentUserId={currentUserId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
