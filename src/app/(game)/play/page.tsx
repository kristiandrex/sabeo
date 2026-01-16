import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import { getDictionary } from "#/app/actions/dictionary";
import { Game } from "#/components/game";
import { NotificationGate } from "#/components/notification-gate";
import { Button } from "#/components/ui/button";
import { GUEST_COOKIE, NUMBER_OF_ROWS } from "#/constants";
import { createClient } from "#/lib/supabase/server";
import { getAttemptsByPlayer, getLatestChallenge } from "#/domain/challenge/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  openGraph: {
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};
export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cookieStore = await cookies();

  const hasGuestPreference = cookieStore.get(GUEST_COOKIE)?.value === "1";
  const isGuest = !user && hasGuestPreference;

  const latestChallenge = await getLatestChallenge();
  const dictionary = await getDictionary();

  async function reload() {
    "use server";
    revalidatePath("/play");
  }

  if (!latestChallenge) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl">No hay reto disponible</h1>
        <Button
          onClick={() => void reload()}
          className="h-12 justify-center gap-2 rounded-xl bg-green-600 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          Volver a cargar
        </Button>
      </div>
    );
  }

  const shouldRegisterChallengeOpen = Boolean(user) && !isGuest;

  const initialAttempts = await getAttemptsByPlayer(latestChallenge.id);
  const challengeIsCompleted = initialAttempts.includes(latestChallenge.word);
  const challengeIsFinished = initialAttempts.length === NUMBER_OF_ROWS || challengeIsCompleted;

  let initialBonusSnapshot: {
    seasonPoints: number;
    currentStreak: number;
    fastBonusAwarded: boolean;
  } | null = null;

  if (user && !isGuest && challengeIsFinished) {
    const { data: seasonRow } = await supabase
      .from("season_scores")
      .select("season_points, current_streak, fast_bonus_awarded")
      .eq("player", user.id)
      .single();

    if (seasonRow) {
      initialBonusSnapshot = {
        seasonPoints: seasonRow.season_points,
        currentStreak: seasonRow.current_streak,
        fastBonusAwarded: seasonRow.fast_bonus_awarded,
      };
    }
  }

  const initialState = {
    attempts: initialAttempts,
    isFinished: challengeIsFinished,
    bonusSnapshot: initialBonusSnapshot,
  };

  return (
    <NotificationGate isAuthenticated={Boolean(user)}>
      <Game
        key={`${latestChallenge.id}-${shouldRegisterChallengeOpen}`}
        dictionary={dictionary}
        challenge={latestChallenge}
        initialState={initialState}
        isGuest={isGuest}
        shouldRegisterChallengeOpen={shouldRegisterChallengeOpen}
      />
    </NotificationGate>
  );
}
