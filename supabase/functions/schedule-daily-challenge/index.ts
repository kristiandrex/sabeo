import { Client } from "@upstash/qstash";

const {
  SUPABASE_FUNCTION_SECRET: functionSecret,
  START_CHALLENGE_INTERNAL_KEY: startChallengeInternalKey,
  PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_URL,
  QSTASH_TOKEN: qstashToken,
  QSTASH_URL: qstashUrl,
} = Deno.env.toObject();

const destinationBaseUrl = PUBLIC_APP_URL ?? NEXT_PUBLIC_APP_URL;

const client = new Client({ token: qstashToken, baseUrl: qstashUrl });

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

  if (authHeader !== `Bearer ${functionSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const runAt = getRandomBogotaDatetime();

  const publishResult = await client.publishJSON({
    url: `${destinationBaseUrl}/api/qstash/start-challenge`,
    body: {
      type: "start_challenge",
    },
    headers: {
      "x-internal-key": startChallengeInternalKey,
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
