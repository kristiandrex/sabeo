import { after, type NextRequest } from "next/server";

import { startChallenge } from "#/domain/challenge/start-challenge";
import { createServiceClient } from "#/lib/supabase/server";

type ServiceSupabaseClient = Awaited<ReturnType<typeof createServiceClient>>;

const START_HOUR_UTC = 13; // 8:00 a.m. Bogotá
const SLOT_MINUTES = 10;
const SLOT_COUNT = 49; // 8:00–16:00 Bogotá inclusive, every 10 minutes

function getScheduleDay(nowUtc: Date): string {
  return nowUtc.toISOString().slice(0, 10);
}

function getRandomRunAt(nowUtc: Date): Date {
  const startOfWindow = Date.UTC(
    nowUtc.getUTCFullYear(),
    nowUtc.getUTCMonth(),
    nowUtc.getUTCDate(),
    START_HOUR_UTC,
    0,
    0,
  );

  const slot = Math.floor(Math.random() * SLOT_COUNT);
  return new Date(startOfWindow + slot * SLOT_MINUTES * 60_000);
}

async function findPendingChallengeId(supabase: ServiceSupabaseClient) {
  const { data, error } = await supabase
    .from("challenges")
    .select("id")
    .is("started_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

async function ensureSchedule(
  supabase: ServiceSupabaseClient,
  nowUtc: Date,
  challengeId: number,
) {
  const challengeDay = getScheduleDay(nowUtc);

  const existing = await supabase
    .from("daily_challenge_schedule")
    .select("challenge_day,scheduled_run_at,triggered_at,challenge_id")
    .eq("challenge_day", challengeDay)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return { schedule: existing.data, created: false };
  }

  const scheduledAt = getRandomRunAt(nowUtc).toISOString();

  const inserted = await supabase
    .from("daily_challenge_schedule")
    .upsert({
      challenge_day: challengeDay,
      scheduled_run_at: scheduledAt,
      challenge_id: challengeId,
    })
    .select("challenge_day,scheduled_run_at,triggered_at,challenge_id")
    .maybeSingle();

  if (inserted.error) {
    throw inserted.error;
  }

  if (!inserted.data) {
    throw new Error("Failed to upsert schedule");
  }

  return { schedule: inserted.data, created: true };
}

async function markNotified(
  supabase: ServiceSupabaseClient,
  challengeDay: string,
  challengeId?: number,
) {
  const payload = {
    triggered_at: new Date().toISOString(),
    challenge_id: challengeId,
  };

  const result = await supabase
    .from("daily_challenge_schedule")
    .update(payload)
    .eq("challenge_day", challengeDay);

  if (result.error) {
    throw result.error;
  }
}

export async function POST(req: NextRequest) {
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return new Response("Missing configuration", { status: 500 });
  }

  try {
    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = await createServiceClient();
    const nowUtc = new Date();
    const challengeDay = getScheduleDay(nowUtc);

    const existing = await supabase
      .from("daily_challenge_schedule")
      .select("challenge_day,scheduled_run_at,triggered_at,challenge_id")
      .eq("challenge_day", challengeDay)
      .maybeSingle();

    if (existing.error) {
      console.error("schedule-daily-challenge failed", existing.error);
      return new Response(
        JSON.stringify({ message: "schedule-daily-challenge failed" }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }

    let schedule = existing.data;
    let created = false;

    if (!schedule) {
      const pendingChallengeId = await findPendingChallengeId(supabase);

      if (!pendingChallengeId) {
        const { error: insertError } = await supabase
          .from("daily_challenge_schedule")
          .insert({
            challenge_day: challengeDay,
            scheduled_run_at: null,
            triggered_at: null,
          });

        if (insertError) {
          throw insertError;
        }

        return new Response(
          JSON.stringify({
            scheduleDay: challengeDay,
            created: true,
            notified: false,
            state: "no_challenge",
            challengeId: null,
          }),
          { headers: { "content-type": "application/json" } },
        );
      }

      const ensured = await ensureSchedule(
        supabase,
        nowUtc,
        pendingChallengeId,
      );
      schedule = ensured.schedule;
      created = ensured.created;
    }

    if (schedule.scheduled_run_at === null) {
      return new Response(
        JSON.stringify({
          scheduleDay: schedule.challenge_day,
          created,
          notified: Boolean(schedule.triggered_at),
          state: "no_challenge",
          challengeId: schedule.challenge_id ?? null,
        }),
        { headers: { "content-type": "application/json" } },
      );
    }

    const scheduledAt = new Date(schedule.scheduled_run_at);
    const shouldNotify = !schedule.triggered_at && nowUtc >= scheduledAt;

    if (!shouldNotify) {
      const state = schedule.triggered_at ? "notified" : "pending";
      return new Response(
        JSON.stringify({
          scheduleDay: schedule.challenge_day,
          scheduledAt: scheduledAt.toISOString(),
          created,
          notified: Boolean(schedule.triggered_at),
          state,
          challengeId: schedule.challenge_id ?? null,
        }),
        { headers: { "content-type": "application/json" } },
      );
    }

    const result = await startChallenge();

    if (result.status === "success") {
      await markNotified(supabase, schedule.challenge_day, result.challengeId);

      after(async () => {
        await result.notifications;
      });
    }

    const state =
      result.status === "not_found"
        ? "no_challenge"
        : result.status === "success"
          ? "notified"
          : "error";

    return new Response(
      JSON.stringify({
        scheduleDay: schedule.challenge_day,
        scheduledAt: scheduledAt.toISOString(),
        created,
        notified: result.status !== "error",
        challengeId:
          result.status === "success"
            ? result.challengeId
            : (schedule.challenge_id ?? null),
        state,
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (error) {
    console.error("schedule-daily-challenge failed", error);

    return new Response(
      JSON.stringify({ message: "schedule-daily-challenge failed" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
