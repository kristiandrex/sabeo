import { Button } from "@radix-ui/themes";
import { revalidatePath } from "next/cache";

import {
  getAttemptsByPlayer,
  getLatestChallenge,
} from "#/app/actions/challenge";
import { Game } from "#/components/game";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayPage() {
  const latestChallenge = await getLatestChallenge();

  async function reload() {
    "use server";
    revalidatePath("/play");
  }

  if (!latestChallenge) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-2">
        <h1 className="text-2xl font-semibold">No hay reto disponible</h1>
        <Button onClick={reload}>Recargar</Button>
      </div>
    );
  }

  const initialAttempts = await getAttemptsByPlayer(latestChallenge.id);

  return <Game challenge={latestChallenge} initialAttempts={initialAttempts} />;
}
