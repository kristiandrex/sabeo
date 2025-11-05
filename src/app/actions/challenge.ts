"use server";

import { createClient } from "#/lib/supabase/server";
import { getLatestChallenge } from "#/queries/challenge";

export async function addAttempt(attempt: string, challenge: number) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("attempts")
      .select()
      .eq("player", user.id)
      .eq("challenge", challenge)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    const attempts = data ? data.attempts.concat(attempt) : [attempt];

    const { error: upsertError } = await supabase
      .from("attempts")
      .upsert({ player: user.id, challenge, attempts });

    if (upsertError) {
      throw upsertError;
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function completeChallenge(): Promise<
  { success: true } | { success: false; error: string }
> {
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
