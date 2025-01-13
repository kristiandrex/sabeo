export type Challenge = {
  id: number;
  word: string;
  description: string;
  started_at: Date;
  created_at: Date;
};

export type Color = "green" | "yellow" | "gray";

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

export type RankingPosition = {
  id: string;
  name: string;
  picture: string;
  challenges: number;
  seconds: number;
};
