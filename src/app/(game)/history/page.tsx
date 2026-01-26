import { redirect } from "next/navigation";

import { HistoryList } from "#/components/history-list";
import { PaginationControls } from "#/components/ui/pagination";
import { getUserChallengeHistory } from "#/domain/challenge/queries";
import { createClient } from "#/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type HistoryPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/play");
  }

  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page ?? 1));
  const perPage = 20;

  const { entries, totalCount } = await getUserChallengeHistory(currentPage, perPage);
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

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
          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Historial</h2>
        </header>

        <HistoryList entries={entries} />

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/history"
          />
        )}
      </div>
    </main>
  );
}
