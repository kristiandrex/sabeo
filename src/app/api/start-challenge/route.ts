import { after, type NextRequest } from "next/server";

import { runStartChallenge } from "#/domain/challenge/start-challenge";

const { SUPABASE_SERVICE_ROLE_KEY } = process.env;

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await runStartChallenge();

    if (result.status === "success") {
      after(async () => {
        await result.notifications;
      });

      return new Response(result.message, { status: 200 });
    }

    if (result.status === "not_found") {
      return new Response(result.message, { status: 404 });
    }

    return new Response(result.message, { status: 500 });
  } catch (error) {
    console.error(error);

    return new Response("An error occurred while sending notifications", {
      status: 500,
    });
  }
}
