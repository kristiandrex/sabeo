import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getDictionary } from "#/app/actions/dictionary";
import { Game } from "#/components/game";
import { NotificationGate } from "#/components/notification-gate";
import { Button } from "#/components/ui/button";
import { GUEST_COOKIE, NUMBER_OF_ROWS } from "#/constants";
import { createClient } from "#/lib/supabase/server";
import { getAttemptsByPlayer, getLatestChallenge } from "#/queries/challenge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <div className="flex h-screen items-center justify-center flex-col gap-2">
        <h1 className="text-2xl">No hay reto disponible</h1>
        <Button onClick={reload}>Recargar</Button>
      </div>
    );
  }

  const initialAttempts = await getAttemptsByPlayer(latestChallenge.id);
  const challengeIsCompleted = initialAttempts.includes(latestChallenge.word);
  const challengeIsFinished =
    initialAttempts.length === NUMBER_OF_ROWS || challengeIsCompleted;

  return (
    <NotificationGate isAuthenticated={Boolean(user)}>
      <Game
        dictionary={dictionary}
        challenge={latestChallenge}
        initialAttempts={initialAttempts}
        challengeIsFinished={challengeIsFinished}
        onFinishChallenge={reload}
        isGuest={isGuest}
      />
    </NotificationGate>
  );
}
