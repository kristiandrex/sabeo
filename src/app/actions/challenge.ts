"use server";

import { PostgrestSingleResponse } from "@supabase/supabase-js";

import { createClient, createServiceClient } from "#/lib/supabase/server";
import { Challenge } from "#/types";

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

export async function completeChallenge() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return {
        success: false,
        error: "Debes iniciar sesión para completar el reto",
      };
    }

    const latestChallenge = await getLatestChallenge();

    if (!latestChallenge) {
      return {
        success: false,
        error: "No hay reto disponible",
      };
    }

    const { error } = await supabase.from("challenges_completed").insert({
      challenge: latestChallenge.id,
      player: data.user.id,
    });

    if (error?.code === "23505") {
      return {
        success: false,
        error: "Ya completaste este reto",
      };
    }

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "No se pudo completar el reto, intenta de nuevo",
    };
  }
}

export async function getAttemptsByPlayer(challenge: number) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const query: PostgrestSingleResponse<string[]> = await supabase
      .from("attempts")
      .select("*")
      .eq("player", user.id)
      .eq("challenge", challenge);

    if (query.error) {
      throw query.error;
    }

    return query.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
