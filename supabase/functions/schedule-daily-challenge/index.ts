import { Client } from "@upstash/qstash";

const {
  SUPABASE_FUNCTION_SECRET,
  START_CHALLENGE_INTERNAL_KEY,
  START_CHALLENGE_URL,
  QSTASH_TOKEN,
  QSTASH_URL,
} = Deno.env.toObject();

const client = new Client({ token: QSTASH_TOKEN, baseUrl: QSTASH_URL });

function getRandomBogotaDatetime(date = new Date()): Date {
  const randomMinutes = Math.floor(Math.random() * 8 * 60);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      13,
      randomMinutes
    )
  );
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${SUPABASE_FUNCTION_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const runAt = getRandomBogotaDatetime();

  const publishResult = await client.publishJSON({
    url: `${START_CHALLENGE_URL}/api/qstash/start-challenge`,
    body: {
      type: "start_challenge",
    },
    headers: {
      "x-internal-key": START_CHALLENGE_INTERNAL_KEY,
      "content-type": "application/json",
    },
    notBefore: Math.floor(runAt.getTime() / 1000),
    retries: 3,
    label: `start-challenge-${runAt.toISOString()}`,
  });

  return new Response(
    JSON.stringify({
      messageId: publishResult.messageId,
      runAt: runAt.toISOString(),
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
});
