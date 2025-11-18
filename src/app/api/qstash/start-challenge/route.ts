import { Receiver } from "@upstash/qstash";
import { after, type NextRequest } from "next/server";

import { runStartChallenge } from "#/domain/challenge/start-challenge";

const {
  QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const receiver = new Receiver({
  currentSigningKey: QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("upstash-signature");

    if (!signature) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.text();

    try {
      await receiver.verify({ signature, body, url: req.url });
    } catch (verificationError) {
      console.error("Invalid QStash signature", verificationError);
      return new Response("Unauthorized", { status: 401 });
    }

    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await runStartChallenge();

    if (result.status === "success") {
      after(async () => {
        await result.notifications;
      });

      return new Response(JSON.stringify({ message: result.message }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (result.status === "not_found") {
      return new Response(JSON.stringify({ message: result.message }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: result.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
