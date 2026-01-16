import { after, type NextRequest } from "next/server";

import { startChallenge } from "#/domain/challenge/start-challenge";
import { createServiceClient } from "#/lib/supabase/server";

type ServiceSupabaseClient = Awaited<ReturnType<typeof createServiceClient>>;

function getScheduleDay(nowUtc: Date): string {
  return nowUtc.toISOString().slice(0, 10);
}

async function getTodaySchedule(supabase: ServiceSupabaseClient, challengeDay: string) {
  const result = await supabase
    .from("daily_challenge_schedule")
    .select("challenge_day,scheduled_run_at,triggered_at,challenge_id")
    .eq("challenge_day", challengeDay)
    .maybeSingle();

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

async function markTriggered(
  supabase: ServiceSupabaseClient,
  challengeDay: string,
  challengeId: number,
) {
  const payload = {
    triggered_at: new Date().toISOString(),
    challenge_id: challengeId,
  };

  const result = await supabase
    .from("daily_challenge_schedule")
    .update(payload)
    .eq("challenge_day", challengeDay)
    .is("triggered_at", null);

  if (result.error) {
    throw result.error;
  }
}

export async function POST(req: NextRequest) {
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ message: "Missing configuration" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const supabase = await createServiceClient();
    const nowUtc = new Date();
    const challengeDay = getScheduleDay(nowUtc);
    const schedule = await getTodaySchedule(supabase, challengeDay);

    if (!schedule || schedule.scheduled_run_at === null) {
      return new Response(JSON.stringify({ message: "No schedule available" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    if (schedule.triggered_at) {
      return new Response(JSON.stringify({ message: "Challenge already started" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      });
    }

    const scheduledAt = new Date(schedule.scheduled_run_at);

    if (nowUtc < scheduledAt) {
      return new Response(JSON.stringify({ message: "Scheduled time not reached" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      });
    }

    const result = await startChallenge();

    if (result.status === "error") {
      throw new Error(result.message);
    }

    if (result.status === "not_found") {
      return new Response(JSON.stringify({ message: "No challenge available" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    await markTriggered(supabase, schedule.challenge_day, result.challengeId);

    after(async () => {
      await result.notifications;
    });

    return new Response(
      JSON.stringify({
        challengeId: result.challengeId,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        message: "An error occurred while starting the challenge",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
