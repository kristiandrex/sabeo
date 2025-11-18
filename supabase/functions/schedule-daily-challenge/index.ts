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

if (!functionSecret || !startChallengeInternalKey || !destinationBaseUrl || !qstashToken) {
  throw new Error("Missing environment variables for schedule-daily-challenge");
}

const client = new Client({ token: qstashToken, baseUrl: qstashUrl });

function getRandomBogotaDatetime(date = new Date()): Date {
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDate = date.getUTCDate();

  const randomMinutes = Math.floor(Math.random() * (8 * 60));

  const windowStartUtc = Date.UTC(utcYear, utcMonth, utcDate, 13, 0, 0);
  return new Date(windowStartUtc + randomMinutes * 60 * 1000);
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
