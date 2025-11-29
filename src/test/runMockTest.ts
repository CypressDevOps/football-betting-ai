// src/runMockTest.ts
import { Recommendation } from "../services/recommendationService";
import { matches } from "../mockData";
import { RecommendationService } from "../services/recommendationService";
import type { Match } from "../types/types";

// Demo Injuries und Form für Mock-Test
const injuriesMap: Record<string, number> = {
  "Juventus": 1,
  "AC Milan": 2,
  "Barcelona": 1,
  "Real Madrid": 2,
  "Bayern München": 1,
  "Borussia Dortmund": 1
};

const recentFormMap: Record<string, number> = {
  "Juventus": 0.72,
  "AC Milan": 0.58,
  "Barcelona": 0.81,
  "Real Madrid": 0.77,
  "Bayern München": 0.67,
  "Borussia Dortmund": 0.61
};

// Grober MarketSignal: positive Werte für Favoriten-Heimsieg
const calculateMarketSignal = (match: Match): number => {
  const homeOdd = match.odds.home ?? 1.8;
  const drawOdd = match.odds.draw ?? 3;
  const awayOdd = match.odds.away ?? 4;
  // normalize: 1.8-4 → 0..1
  const signal = ((1 / homeOdd) - (1 / awayOdd)) * 0.5; 
  return signal;
};

(async () => {
  // Injuries, Form und MarketSignal in Matches einfügen
  const enrichedMatches: Match[] = matches.map(m => ({
    ...m,
    formHome: recentFormMap[m.homeTeam.name] ?? 0.5,
    formAway: recentFormMap[m.awayTeam.name] ?? 0.5,
    injuriesHome: injuriesMap[m.homeTeam.name] ?? 0,
    injuriesAway: injuriesMap[m.awayTeam.name] ?? 0,
    marketSignal: calculateMarketSignal(m)
  }));

  const recService = new RecommendationService();

  const picks = recService.generateRecommendations(enrichedMatches);

  console.log("\n=== TOP 3 WETT-TIPPS DER KI ===\n");
  picks.forEach((p: Recommendation, idx: number) => {
    console.log(`${idx + 1}. ${p.matchKey}`);
    console.log(`   Empfehlung: ${p.betType}`);
    console.log(`   Quote: ${p.odds}`);
    console.log(`   KI-Score: ${(p.kiScore * 100).toFixed(0)} %`); // KI-Score als Prozent
  });
})();
