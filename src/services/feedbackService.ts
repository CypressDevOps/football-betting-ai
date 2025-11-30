// src/services/feedbackService.ts
import type { Recommendation } from "./recommendationService";

export interface FeedbackEntry {
  matchKey: string;
  recommendedBet: string;
  kiScore: number;
  odds: number;
  outcome: boolean;
  timestamp: number;
}

export const feedbackDB: FeedbackEntry[] = [];

export function recordFeedback(rec: Recommendation, outcome: boolean) {
  feedbackDB.push({
    matchKey: rec.matchKey,
    recommendedBet: rec.betType,
    kiScore: rec.kiScore,
    odds: rec.odds,
    outcome,
    timestamp: Date.now()
  });
}
