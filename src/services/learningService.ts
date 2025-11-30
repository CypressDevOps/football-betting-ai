// src/services/learningService.ts
import { feedbackDB, FeedbackEntry } from "./feedbackService";
import { defaultWeights, KIWeights } from "../config/weights";

/**
 * Analysiert die letzten Feedback-Einträge und passt die Gewichtungen an.
 * Idee: Erfolgsquote pro Tipptyp → Gewichtungen erhöhen oder senken.
 */
export function updateWeights(lookback: number = 50, learningRate: number = 0.05): KIWeights {
  const recent: FeedbackEntry[] = feedbackDB.slice(-lookback);
  if (!recent.length) return defaultWeights;

  // Erfolgsquote berechnen
  const successRate = recent.filter(f => f.outcome).length / recent.length;

  // Anpassung: Bei niedriger Quote mehr Gewicht auf Form, weniger auf Markt
  if (successRate < 0.5) {
    defaultWeights.wForm = Math.min(defaultWeights.wForm + learningRate, 1);
    defaultWeights.wMarket = Math.max(defaultWeights.wMarket - learningRate, 0);
  } else if (successRate > 0.7) {
    defaultWeights.wForm = Math.max(defaultWeights.wForm - learningRate, 0);
    defaultWeights.wMarket = Math.min(defaultWeights.wMarket + learningRate, 1);
  }

  // Intercept leicht anpassen proportional zur Erfolgsquote
  defaultWeights.intercept = 0.4 * successRate + 0.1;

  console.log("Aktualisierte Gewichtungen:", defaultWeights);
  return defaultWeights;
}

/**
 * Optional: Feedback nach erfolgreichem Spiel aktualisieren
 */
export function markOutcome(matchKey: string, betType: string, outcome: boolean) {
  feedbackDB.forEach(f => {
    if (f.matchKey === matchKey && f.recommendedBet === betType) {
      f.outcome = outcome;
    }
  });
}
