import { gatherMatchData } from "../services/matchService";
import { RecommendationService, Recommendation } from "../services/recommendationService";
import type { Match } from "../types/types";

(async () => {
  // 1. Matches & Odds abrufen
  const { matches /*, oddsEntries */ } = await gatherMatchData();

  // 2. Injuries/Form optional – hier kannst du Transfermarkt-Scraper oder eigene Logik nutzen
  const injuriesMap: Record<string, number> = {}; // z.B. injuriesMap["Bayern München"] = 1
  const recentFormMap: Record<string, number> = {}; // z.B. recentFormMap["Bayern München"] = 0.8

  // 3. Matches anreichern
  const enrichedMatches: Match[] = matches.map(m => ({
    ...m,
    formHome: recentFormMap[m.homeTeam.name] ?? 0.5,
    formAway: recentFormMap[m.awayTeam.name] ?? 0.5,
    injuriesHome: injuriesMap[m.homeTeam.name] ?? 0,
    injuriesAway: injuriesMap[m.awayTeam.name] ?? 0,
    marketSignal: 0 // optional, z.B. kann aus Odds berechnet werden
  }));

  // 4. Empfehlungen generieren
  const recService = new RecommendationService();
  const picks: Recommendation[] = recService.generateRecommendations(enrichedMatches);

  console.log("\n=== TOP 3 WETT-TIPPS DER KI ===\n");
  picks.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.matchKey}`);
    console.log(`   Empfehlung: ${p.betType}`);
    console.log(`   Quote: ${p.odds}`);
    console.log(`   KI-Score: ${p.kiScore.toFixed(3)}`);
  });
})();
