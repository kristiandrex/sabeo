import { createClient } from "@supabase/supabase-js";

const {
  START_CHALLENGE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} = Deno.env.toObject();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: "jobs" },
});

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

async function ensureSchedule(nowUtc: Date) {
  const challengeDay = getScheduleDay(nowUtc);

  const existing = await supabase
    .from("daily_challenge_schedule")
    .select("challenge_day,scheduled_run_at,triggered_at")
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
    .upsert({ challenge_day: challengeDay, scheduled_run_at: scheduledAt })
    .select("challenge_day,scheduled_run_at,triggered_at")
    .maybeSingle();

  if (inserted.error) {
    throw inserted.error;
  }

  if (!inserted.data) {
    throw new Error("Failed to upsert schedule");
  }

  return { schedule: inserted.data, created: true };
}

async function markNotified(challengeDay: string) {
  const result = await supabase
    .from("daily_challenge_schedule")
    .update({ triggered_at: new Date().toISOString() })
    .eq("challenge_day", challengeDay);

  if (result.error) {
    throw result.error;
  }
}

async function triggerStartChallenge() {
  const response = await fetch(START_CHALLENGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  };
}

Deno.serve(async (req) => {
  if (
    req.headers.get("authorization") !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const nowUtc = new Date();

  try {
    const { schedule, created } = await ensureSchedule(nowUtc);
    const scheduledAt = new Date(schedule.scheduled_run_at);
    const shouldNotify = !schedule.triggered_at && nowUtc >= scheduledAt;

    if (!shouldNotify) {
      return new Response(
        JSON.stringify({
          scheduleDay: schedule.challenge_day,
          scheduledAt: scheduledAt.toISOString(),
          created,
          notified: Boolean(schedule.triggered_at),
          status: "pending",
        }),
        { headers: { "content-type": "application/json" } },
      );
    }

    const result = await triggerStartChallenge();

    if (result.ok || result.status === 404) {
      await markNotified(schedule.challenge_day);
    }

    return new Response(
      JSON.stringify({
      scheduleDay: schedule.challenge_day,
      scheduledAt: scheduledAt.toISOString(),
        created,
      notified: result.ok || result.status === 404,
        status: result.status,
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
});
