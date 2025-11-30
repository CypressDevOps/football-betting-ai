// src/index.ts
import dotenv from "dotenv";
import { gatherMatchData } from "./services/matchService";
import { calculateTeamForm } from "./services/formService";
import { RecommendationService } from "./services/recommendationService";
import type { Match } from "./types/types";

dotenv.config();

async function main() {
  try {
    // Matches + Odds abrufen
    const { matches, oddsEntries } = await gatherMatchData();

    // InjuriesMap optional
    const injuriesMap: Record<string, number> = {};

    // Formwerte berechnen
    const recentFormMap: Record<string, number> = {};
    matches.forEach(m => {
      recentFormMap[m.homeTeam.name] = calculateTeamForm(m.homeTeam.name, matches);
      recentFormMap[m.awayTeam.name] = calculateTeamForm(m.awayTeam.name, matches);
    });

    // Matches anreichern
    const enrichedMatches: Match[] = matches.map(m => ({
      ...m,
      formHome: recentFormMap[m.homeTeam.name] ?? 0.5,
      formAway: recentFormMap[m.awayTeam.name] ?? 0.5,
      injuriesHome: injuriesMap[m.homeTeam.name] ?? 0,
      injuriesAway: injuriesMap[m.awayTeam.name] ?? 0,
      marketSignal: 0 // optional: hier Odds nutzen
    }));

    // Recommendation-Service
    const recService = new RecommendationService(1.8, 3);
    const topPicks = recService.generateRecommendations(enrichedMatches);

    console.log("=== Top 3 Wett-Tipps ===");
    topPicks.forEach((p, i) => {
      console.log(`${i + 1}. ${p.matchKey}`);
      console.log(`   Empfehlung: ${p.betType}`);
      console.log(`   Quote: ${p.odds}`);
      console.log(`   KI-Score: ${(p.kiScore * 100).toFixed(0)} %`);
    });

  } catch (err: any) {
    console.error("Fehler beim Generieren der Wett-Tipps:", err.message || err);
  }
}

main();
