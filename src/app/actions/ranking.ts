"use server";

import { createServiceClient } from "#/lib/supabase/server";
import {
  DailyChallengeCompleted,
  RankingPosition,
  ChallengeCompleted,
} from "#/types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export async function getDailyRanking() {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const dailyChallenges: PostgrestSingleResponse<DailyChallengeCompleted[]> =
      await supabase.rpc("get_daily_ranking");

    if (dailyChallenges.error) {
      throw dailyChallenges.error;
    }

    const ranking: RankingPosition[] = [];

    for (const challenge of dailyChallenges.data) {
      const player = data.users.find((user) => user.id === challenge.player);

      if (player) {
        ranking.push({
          id: player.id,
          name: player.user_metadata.name,
          picture: player.user_metadata.picture,
          challenges: 1,
          seconds: challenge.seconds,
        });
      }
    }

    return ranking;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRanking() {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const challengesCompleted: PostgrestSingleResponse<ChallengeCompleted[]> =
      await supabase.rpc("get_challenges_completed");

    if (challengesCompleted.error) {
      throw challengesCompleted.error;
    }

    const ranking: RankingPosition[] = [];

    for (const challenge of challengesCompleted.data) {
      const player = data.users.find((user) => user.id === challenge.player);

      if (player) {
        ranking.push({
          id: player.id,
          name: player.user_metadata.name,
          picture: player.user_metadata.picture,
          challenges: challenge.total_challenges,
          seconds: challenge.total_seconds,
        });
      }
    }

    return ranking;
  } catch (error) {
    console.error(error);
    return [];
  }
}
