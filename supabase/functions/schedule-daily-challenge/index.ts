import { createClient } from "@supabase/supabase-js";

const { START_CHALLENGE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } =
  Deno.env.toObject();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
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

async function findPendingChallengeId(): Promise<number | null> {
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

async function ensureSchedule(nowUtc: Date, challengeId: number) {
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

async function markNotified(challengeDay: string, challengeId?: number) {
  const payload = {
    triggered_at: new Date().toISOString(),
    ...(challengeId !== undefined ? { challenge_id: challengeId } : {}),
  };

  const result = await supabase
    .from("daily_challenge_schedule")
    .update(payload)
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

  const body = response.ok ? await response.json() : null;

  return {
    ok: response.ok,
    status: response.status,
    challengeId: body?.challengeId as number | undefined,
  };
}

Deno.serve(async (req) => {
  if (
    req.headers.get("authorization") !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

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

  try {
    let schedule = existing.data;
    let created = false;

    if (!schedule) {
      const pendingChallengeId = await findPendingChallengeId();

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

      const ensured = await ensureSchedule(nowUtc, pendingChallengeId);
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

    const result = await triggerStartChallenge();

    if (result.ok) {
      await markNotified(schedule.challenge_day, result.challengeId);
    }

    const state =
      result.status === 404 ? "no_challenge" : result.ok ? "notified" : "error";

    return new Response(
      JSON.stringify({
        scheduleDay: schedule.challenge_day,
        scheduledAt: scheduledAt.toISOString(),
        created,
        notified: result.ok || result.status === 404,
        challengeId: result.challengeId ?? schedule.challenge_id ?? null,
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
});
