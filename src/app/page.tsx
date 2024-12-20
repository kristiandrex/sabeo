import { Game } from "#/components/game";
import { getLatestChallenge } from "#/app/actions/challenge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const latestChallenge = await getLatestChallenge();

  if (!latestChallenge) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-semibold">No hay reto disponible</h1>
      </div>
    );
  }

  return <Game challenge={latestChallenge} />;
}
