// src/services/recommendationService.ts
import { Match } from "../types/types";
import { KIWeights, defaultWeights } from "../config/weights";

export interface Recommendation {
  matchKey: string;
  homeTeam: string;
  awayTeam: string;
  betType: "1" | "OVER_2_5" | "BTTS";
  odds: number;
  kiScore: number;
  modelProbability: number;
}

export class RecommendationService {
  constructor(private weights: KIWeights = defaultWeights, private topK = 3) {}

  private logistic(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private computeKiScore(match: Match): number {
    const formHome = match.formHome ?? 0.5;
    const formAway = match.formAway ?? 0.5;
    const formDiff = formHome - formAway;

    const homeEffect = 0.1;
    const injuryHome = match.injuriesHome ?? 0;
    const injuryAway = match.injuriesAway ?? 0;
    const injuryEffect = (injuryAway - injuryHome) * 0.05;
    const marketSignal = match.marketSignal ?? 0;

    const w = this.weights;

    const rawScore =
      (w.intercept ?? 0) +
      (w.wForm ?? 1) * formDiff +
      (w.wHome ?? 1) * homeEffect +
      (w.wInjury ?? 1) * injuryEffect +
      (w.wMarket ?? 1) * marketSignal;

    return this.logistic(rawScore);
  }

  private generateBets(match: Match, kiScore: number): Recommendation[] {
    const matchKey = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    return [
      {
        matchKey,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        betType: "1",
        odds: match.odds.home ?? 0,
        kiScore,
        modelProbability: kiScore
      },
      {
        matchKey,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        betType: "OVER_2_5",
        odds: match.odds.over25 ?? 0,
        kiScore: kiScore * 0.9,
        modelProbability: kiScore * 0.9
      },
      {
        matchKey,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        betType: "BTTS",
        odds: match.odds.btts ?? 0,
        kiScore: kiScore * 0.85,
        modelProbability: kiScore * 0.85
      }
    ];
  }

  public generateRecommendations(matches: Match[]): Recommendation[] {
    const allRecommendations: Recommendation[] = [];
    for (const m of matches) {
      const kiScore = this.computeKiScore(m);
      const bets = this.generateBets(m, kiScore).filter(b => b.odds >= 1.8);
      allRecommendations.push(...bets);
    }

    return allRecommendations
      .sort((a, b) => b.modelProbability - a.modelProbability)
      .slice(0, this.topK);
  }
}
