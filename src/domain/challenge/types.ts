export type Challenge = {
  id: number;
  word: string;
  description: string;
  started_at: Date;
  created_at: Date;
};

export type Color = "green" | "yellow" | "gray";

export type ChallengeStatus = "completed" | "played";

export type ChallengeHistoryEntry = {
  challengeId: number;
  challengeNumber: number;
  challengeDate: Date;
  status: ChallengeStatus;
};
