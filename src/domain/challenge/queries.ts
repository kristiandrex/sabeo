import { createClient, createServiceClient } from "#/lib/supabase/server";
import type { Challenge, ChallengeHistoryEntry, ChallengeStatus } from "#/domain/challenge/types";

export async function getLatestChallenge(): Promise<Challenge | null> {
  try {
    const supabase = await createServiceClient();

    const { data } = await supabase
      .from("challenges")
      .select("*")
      .not("started_at", "is", null)
      .order("started_at", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChallengeCount(): Promise<number> {
  try {
    const supabase = await createServiceClient();

    const { count, error } = await supabase
      .from("challenges")
      .select("*", { count: "exact", head: true })
      .not("started_at", "is", null);

    if (error) {
      throw error;
    }

    return count ?? 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function getAttemptsByPlayer(challenge: number) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const query = await supabase
      .from("attempts")
      .select("attempts")
      .eq("player", user.id)
      .eq("challenge", challenge)
      .single();

    if (query.error?.code === "PGRST116") {
      return [];
    }

    if (query.error) {
      throw query.error;
    }

    return query.data.attempts;
  } catch (error) {
    console.error(error);
    return [];
  }
}

type ChallengeHistoryRow = {
  challenge_id: number;
  started_at: string;
  status: ChallengeStatus;
  challenge_number: number;
  total_count: number;
};

export async function getUserChallengeHistory(
  page = 1,
  perPage = 20,
): Promise<{
  entries: ChallengeHistoryEntry[];
  totalCount: number;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { entries: [], totalCount: 0 };
    }

    const offset = Math.max(0, (page - 1) * perPage);

    const { data, error } = await supabase.rpc("get_user_challenge_history", {
      p_player: user.id,
      p_offset: offset,
      p_limit: perPage,
    });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as ChallengeHistoryRow[];
    const totalCount = rows[0]?.total_count ?? 0;
    const entries = rows.map((row) => ({
      challengeId: row.challenge_id,
      challengeNumber: row.challenge_number,
      challengeDate: new Date(row.started_at),
      status: row.status,
    }));

    return { entries, totalCount };
  } catch (error) {
    console.error(error);
    return { entries: [], totalCount: 0 };
  }
}
