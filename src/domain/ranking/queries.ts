import { createServiceClient } from "#/lib/supabase/server";
import type {
  DailyChallengeCompleted,
  SeasonRankingRow,
  SeasonRankingPosition,
  DailyRankingPosition,
} from "#/domain/ranking/types";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

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

    const ranking: DailyRankingPosition[] = [];

    for (const challenge of dailyChallenges.data) {
      const player = data.users.find((user) => user.id === challenge.player);

      if (player) {
        ranking.push({
          id: player.id,
          name: player.user_metadata.name,
          picture: player.user_metadata.picture,
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

export async function getRanking(limit?: number) {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const seasonRanking: PostgrestSingleResponse<SeasonRankingRow[]> =
      typeof limit === "number"
        ? await supabase.rpc("get_active_season_ranking").limit(limit)
        : await supabase.rpc("get_active_season_ranking");

    if (seasonRanking.error) {
      throw seasonRanking.error;
    }

    const ranking: SeasonRankingPosition[] = [];

    for (const row of seasonRanking.data) {
      const player = data.users.find((user) => user.id === row.player);

      if (player) {
        ranking.push({
          id: player.id,
          name: player.user_metadata.name,
          picture: player.user_metadata.picture,
          seasonPoints: row.season_points,
          currentStreak: row.current_streak,
        });
      }
    }

    return ranking;
  } catch (error) {
    console.error(error);
    return [];
  }
}
