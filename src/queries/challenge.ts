import { createClient, createServiceClient } from "#/lib/supabase/server";
import type { Challenge } from "#/types/challenge";

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
