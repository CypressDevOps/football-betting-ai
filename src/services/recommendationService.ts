// src/services/recommendationService.ts
import type { Match } from "../types/types";

export interface Recommendation {
  matchKey: string;
  homeTeam: string;
  awayTeam: string;
  betType: "1" | "2" | "Over 2,5" | "Over 3,5" | "Under 2,5" | "Under 3,5" | "Goal/Goal";
  odds: number;
  kiScore: number;
  modelProbability: number;
}

export class RecommendationService {
  constructor(private minOdds: number = 1.8, private topK: number = 3) {}

  public generateRecommendations(matches: Match[]): Recommendation[] {
  const allRecommendations: Recommendation[] = [];
  const logistic = (x: number) => 1 / (1 + Math.exp(-x));

  for (const m of matches) {
    const formHome = m.formHome ?? 0.5;
    const formAway = m.formAway ?? 0.5;
    const marketSignal = m.marketSignal ?? 0;

    const scoreHomeWin = logistic((formHome - formAway) + marketSignal);
    const scoreOver25 = logistic((formHome + formAway) / 2 + marketSignal * 0.5);
    const scoreOver35 = logistic((formHome + formAway) / 2 + marketSignal * 0.4);
    const scoreBTTS = logistic((formHome * formAway) + marketSignal * 0.3);

    const bets: Recommendation[] = [
      {
        matchKey: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        betType: "1",
        odds: m.odds?.home ?? 1.8,
        kiScore: scoreHomeWin,
        modelProbability: scoreHomeWin
      },
      {
        matchKey: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        betType: "Over 2,5",
        odds: m.odds?.over25 ?? 2,
        kiScore: scoreOver25,
        modelProbability: scoreOver25
      },
      {
        matchKey: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        betType: "Over 3,5",
        odds: m.odds?.over35 ?? 2.2,
        kiScore: scoreOver35,
        modelProbability: scoreOver35
      },
      {
        matchKey: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        betType: "Goal/Goal",
        odds: m.odds?.btts ?? 1.9,
        kiScore: scoreBTTS,
        modelProbability: scoreBTTS
      }
    ];

    // Filter nach minOdds
    allRecommendations.push(...bets.filter(b => b.odds >= this.minOdds));
  }

  // Duplikate entfernen: gleiche matchKey + betType
  const uniqueMap = new Map<string, Recommendation>();
  for (const rec of allRecommendations) {
    const key = `${rec.matchKey}|${rec.betType}`;
    const existing = uniqueMap.get(key);
    if (!existing || rec.modelProbability > existing.modelProbability || 
        (rec.modelProbability === existing.modelProbability && rec.odds > existing.odds)) {
      uniqueMap.set(key, rec);
    }
  }

  // Sortiere nach Score, bei Gleichstand nach Quote
  return Array.from(uniqueMap.values())
    .sort((a, b) => b.modelProbability - a.modelProbability || b.odds - a.odds)
    .slice(0, this.topK);
}

}
