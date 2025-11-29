// src/types/recommendationTypes.ts
export interface Pick {
  matchKey: string;       // z.B. "Juventus vs AC Milan"
  recommendation: string; // z.B. "Home Win", "Over 2.5"
  odds: number;           // Wettquote
  kiScore: number;        // KI-Berechnung (ersetzt score/modelProbability)
  confidence: number;     // 0..1
  reasons: string[];      // Erklärungsbulletpoints
}
