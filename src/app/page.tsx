import { Fragment } from "react";

import { OnboardingSteps } from "#/components/onboarding-steps";
import { Game } from "#/components/game";
import { getLatestChallenge } from "#/actions/challenge";

export default async function Home() {
  const latestChallenge = await getLatestChallenge();

  if (!latestChallenge) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-semibold">No hay reto disponible</h1>
      </div>
    );
  }

  return (
    <Fragment>
      <OnboardingSteps />
      <Game challenge={latestChallenge} />
    </Fragment>
  );
}
