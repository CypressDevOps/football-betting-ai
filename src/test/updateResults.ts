// src/test/runLiveTest.ts
import * as dotenv from "dotenv";
dotenv.config();

import { gatherMatchData } from "../services/matchService";
import { KiPredictionService } from "../services/kiPredictionService";
import { RecommendationService } from "../services/recommendationService";
import { OPENAI_API_KEY } from "../util/env";

async function runLiveTest() {
  const { matches } = await gatherMatchData();
  if (!matches.length) {
    console.log("Keine Spiele gefunden!");
    return;
  }

  // KI nur nutzen, wenn Key vorhanden
  const kiService = OPENAI_API_KEY ? new KiPredictionService(OPENAI_API_KEY) : undefined;
  const recommendationService = new RecommendationService(kiService, 1.8, 3);

  // KI-Vorhersagen parallel abrufen, falls vorhanden
  const predictions = await Promise.all(
    matches.map(async (match) => {
      if (kiService) {
        try {
          const kiPrediction = await kiService.getPrediction(match);
          return {
            ...match,
            kiPrediction,
            formHome: match.formHome ?? 0.5,
            formAway: match.formAway ?? 0.5,
            marketSignal: match.marketSignal ?? 0,
            odds: match.odds
          };
        } catch {
          // Fallback
        }
      }
      return {
        ...match,
        formHome: match.formHome ?? 0.5,
        formAway: match.formAway ?? 0.5,
        marketSignal: match.marketSignal ?? 0,
        odds: match.odds
      };
    })
  );

  console.log("=== LIVE WETT-TIPPS DER KI FÜR DAS WOCHENENDE ===\n");

  const topRecommendations = await recommendationService.generateRecommendations(predictions);

  topRecommendations
    .sort((a, b) => b.modelProbability - a.modelProbability || b.odds - a.odds)
    .slice(0, 3)
    .forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.matchKey}`);
      console.log(`   Empfehlung: ${rec.betType}`);
      console.log(`   Quote: ${rec.odds}`);
      console.log(`   KI-Score: ${(rec.kiScore*100).toFixed(1)} %`);
      console.log(`   Modell-Wahrscheinlichkeit: ${(rec.modelProbability*100).toFixed(1)} %\n`);
    });
}

runLiveTest().catch(err => console.error("Fehler beim Live-Test:", err));
