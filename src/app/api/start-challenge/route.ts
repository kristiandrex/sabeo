import { after, type NextRequest } from "next/server";

import { startChallenge } from "#/domain/challenge/start-challenge";

const { SUPABASE_SERVICE_ROLE_KEY } = process.env;

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await startChallenge();

    if (result.status === "error") {
      throw new Error(result.message);
    }

    if (result.status === "not_found") {
      return new Response("Not Found", { status: 404 });
    }

    after(async () => {
      await result.notifications;
    });

    return new Response(
      JSON.stringify({
        message: result.message,
        challengeId: result.challengeId,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response("An error occurred while starting the challenge", {
      status: 500,
    });
  }
}
