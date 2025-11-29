// src/runMockTest.ts
import { RecommendationService, Recommendation } from "../services/recommendationService";
import { matches, injuriesMap, recentFormMap } from "../mockData";
import type { Match } from "../types/types";

(async () => {
  // Injuries, Form und Odds in Matches einfügen
  const enrichedMatches: Match[] = matches.map(m => ({
    ...m,
    formHome: recentFormMap[m.homeTeam.name] ?? 0.5,
    formAway: recentFormMap[m.awayTeam.name] ?? 0.5,
    injuriesHome: injuriesMap[m.homeTeam.name]?.length ?? 0,
    injuriesAway: injuriesMap[m.awayTeam.name]?.length ?? 0,
    marketSignal: 0, // optional, hier statisch
    odds: m.odds // Odds direkt aus Match-Objekt
  }));

  const recService = new RecommendationService();
  const picks: Recommendation[] = recService.generateRecommendations(enrichedMatches);

  console.log("\n=== TOP 3 WETT-TIPPS DER KI ===\n");

  picks.forEach((p: Recommendation, idx: number) => {
    console.log(`${idx + 1}. ${p.matchKey}`);
    console.log(`   Empfehlung: ${p.betType}`);
    console.log(`   Quote: ${p.odds}`);
    console.log(`   KI-Score: ${(p.kiScore * 100).toFixed(1)} %`);
  });

})();
