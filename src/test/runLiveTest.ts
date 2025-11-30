// src/test/runLiveTest.ts
import * as dotenv from "dotenv";
dotenv.config();

import { gatherMatchData } from "../services/matchService";
import { KiPredictionService } from "../services/kiPredictionService";
import { RecommendationService } from "../services/recommendationService";
import { OPENAI_API_KEY } from "../util/env";

// Nächstes Wochenende bestimmen (Do–Sa)
function getNextWeekendDates(): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7));
  const nextSaturday = new Date(nextThursday.getTime() + 2 * 24 * 60 * 60 * 1000);
  const format = (d: Date) => d.toISOString().split("T")[0];
  return { dateFrom: format(nextThursday), dateTo: format(nextSaturday) };
}

async function runLiveTest() {
  const { dateFrom, dateTo } = getNextWeekendDates();

  // Matches abrufen
  const { matches } = await gatherMatchData(dateFrom, dateTo);
  if (!matches.length) {
    console.log("Keine Spiele gefunden!");
    return;
  }

  // Duplikate nach Match entfernen
  const uniqueMatchesMap = new Map<string, typeof matches[0]>();
  matches.forEach(m => uniqueMatchesMap.set(`${m.homeTeam.name}|${m.awayTeam.name}`, m));
  const uniqueMatches = Array.from(uniqueMatchesMap.values());

  // Formdaten randomisieren
  uniqueMatches.forEach(m => {
    m.formHome = Math.random() * 0.6 + 0.2;
    m.formAway = Math.random() * 0.6 + 0.2;
    m.marketSignal = 0;
  });

  // KI optional
  const kiService = OPENAI_API_KEY ? new KiPredictionService(OPENAI_API_KEY) : undefined;
  const recommendationService = new RecommendationService(kiService, 1.8, 10);

  const topRecommendations = await recommendationService.generateRecommendations(uniqueMatches);

  // Maximal 1 Wetttipp pro Match, bei Duplikaten: KI-Score >, dann Quote >
  const finalTop3: typeof topRecommendations = [];
  const usedMatches = new Map<string, typeof topRecommendations[0]>();

  for (const rec of topRecommendations) {
    const existing = usedMatches.get(rec.matchKey);
    if (!existing) {
      usedMatches.set(rec.matchKey, rec);
    } else {
      // Duplikat: prüfen nach KI-Score und Quote
      if (rec.kiScore > existing.kiScore ||
          (rec.kiScore === existing.kiScore && rec.odds > existing.odds)) {
        usedMatches.set(rec.matchKey, rec);
      }
    }
  }

  // Top 3 nach KI-Score sortieren
  const finalTopRecommendations = Array.from(usedMatches.values())
    .sort((a, b) => b.kiScore - a.kiScore || b.odds - a.odds)
    .slice(0, 3);

  console.log("\n=== LIVE WETT-TIPPS DER KI FÜR DAS WOCHENENDE ===\n");
  finalTopRecommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.matchKey}`);
    console.log(`   Empfehlung: ${rec.betType}`);
    console.log(`   Quote: ${rec.odds}`);
    console.log(`   KI-Score: ${(rec.kiScore * 100).toFixed(1)} %`);
    console.log(`   Modell-Wahrscheinlichkeit: ${(rec.modelProbability * 100).toFixed(1)} %\n`);
  });
}

runLiveTest().catch(err => console.error("Fehler beim Live-Test:", err));
