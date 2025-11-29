// src/index.ts
import { matches } from "./mockData";
import { gatherMatchData } from "./services/matchService";
import { RecommendationService } from "./services/recommendationService";
import { Match } from "./types/types";
import dotenv from "dotenv";

dotenv.config();
const recService = new RecommendationService();
const topPicks = recService.generateRecommendations(matches);


async function main() {
  try {
    // Matches + Odds abrufen
    const { matches, oddsEntries } = await gatherMatchData();

    // InjuriesMap optional, kann aus Transfermarkt-Scraper befüllt werden
    const injuriesMap: Record<string, number> = {}; 
    // Beispiel: injuriesMap["Bayern München"] = 1;

    // FormMap optional (0..1), kann aus Football-Data oder eigener Berechnung kommen
    const recentFormMap: Record<string, number> = {}; 
    // Beispiel: recentFormMap["Bayern München"] = 0.8;

    // Recommendation-Service initialisieren
    const recService = new RecommendationService();

    // Top-3 Picks generieren
    const topPicks = recService.generateRecommendations(
      matches.map((m) => ({
        ...m,
        formHome: recentFormMap[m.homeTeam.name] ?? 0.5,
        formAway: recentFormMap[m.awayTeam.name] ?? 0.5,
        injuriesHome: injuriesMap[m.homeTeam.name] ?? 0,
        injuriesAway: injuriesMap[m.awayTeam.name] ?? 0,
        marketSignal: 0 // optional, kann aus Odds/Bookmakers berechnet werden
      }))
    );

    console.log("=== Top 3 Wett-Tipps ===");
    topPicks.forEach((p, i) => {
      console.log(`${i + 1}. ${p.matchKey}`);
      console.log(`   Empfehlung: ${p.betType}`);
      console.log(`   Quote: ${p.odds}`);
      console.log(`   KI-Score: ${p.kiScore.toFixed(3)}`);
    });
  } catch (err: any) {
    console.error("Fehler beim Generieren der Wett-Tipps:", err.message || err);
  }
}

main();
