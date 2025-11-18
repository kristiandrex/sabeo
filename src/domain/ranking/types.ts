export type ChallengeCompleted = {
  player: string;
  /**
   * Challenges completed by the player
   */
  total_challenges: number;

  /**
   * Total seconds spent by the player to complete the challenges
   */
  total_seconds: number;
};

export type DailyChallengeCompleted = {
  player: string;
  seconds: number;
};

export type SeasonRankingRow = {
  player: string;
  season_points: number;
  current_streak: number;
  fast_bonus_awarded: boolean;
  missed_in_a_row: number;
};

export type SeasonRankingPosition = {
  id: string;
  name: string;
  picture: string;
  seasonPoints: number;
  currentStreak: number;
};

export type DailyRankingPosition = {
  id: string;
  name: string;
  picture: string;
  seconds: number;
};
