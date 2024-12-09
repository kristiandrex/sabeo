"use server";

import { createServiceClient } from "#/lib/supabase/server";
import { Challenge } from "#/types/Challenge";

export async function getLatestChallenge(): Promise<Challenge | null> {
  try {
    const client = await createServiceClient();

    const { data } = await client
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: true })
      .not("started_at", "is", null)
      .limit(1)
      .single();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
