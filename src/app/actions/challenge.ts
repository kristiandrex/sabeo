"use server";

import { createClient, createServiceClient } from "#/lib/supabase/server";
import { Challenge } from "#/types";

export async function getLatestChallenge(): Promise<Challenge | null> {
  try {
    const supabase = await createServiceClient();

    const { data } = await supabase
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
