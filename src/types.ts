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
  total_challenges: number;
  total_seconds: number;
};

export type RankingPosition = {
  id: string;
  name: string;
  picture: string;
  challenges: number;
  seconds: number;
};
