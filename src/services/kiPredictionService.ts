// src/services/kiPredictionService.ts
import type { Match } from '../types/types';
import fetch from 'node-fetch';

export interface KiPrediction {
  probHomeWin: number;
  probDraw: number;
  probAwayWin: number;
  probOver25: number;
  probOver35: number;
  probBTTS: number;
}

export class KiPredictionService {
  constructor(private apiKey: string) {}

  async getPrediction(match: Match): Promise<KiPrediction> {
    const prompt = `
      Team A: ${match.homeTeam.name}, Team B: ${match.awayTeam.name}.
      Aktuelle Form: Home=${match.formHome ?? 0.5}, Away=${match.formAway ?? 0.5}.
      Markt-Signal: ${match.marketSignal ?? 0}.
      Liefere Wahrscheinlichkeiten 0..1 für: HomeWin, Draw, AwayWin, Over2.5, Over3.5, BTTS.
      Gib die Antwort ausschließlich als JSON-Objekt zurück.
    `;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: prompt
      })
    });

    const data: any = await response.json();

    // Standardwerte
    let output: KiPrediction = {
      probHomeWin: 0.5,
      probDraw: 0.33,
      probAwayWin: 0.5,
      probOver25: 0.5,
      probOver35: 0.4,
      probBTTS: 0.5
    };

    try {
      // KI-Antwort korrekt extrahieren
      if (data.output && Array.isArray(data.output) && data.output.length > 0) {
        const contentArray = data.output[0].content;
        if (Array.isArray(contentArray)) {
          for (const c of contentArray) {
            if (c.type === "output_text" && c.text) {
              const matchJSON = c.text.match(/\{[\s\S]*\}/);
              if (matchJSON) {
                const parsed = JSON.parse(matchJSON[0]);
                output = {
                  probHomeWin: parsed.probHomeWin ?? 0.5,
                  probDraw: parsed.probDraw ?? 0.33,
                  probAwayWin: parsed.probAwayWin ?? 0.5,
                  probOver25: parsed.probOver25 ?? 0.5,
                  probOver35: parsed.probOver35 ?? 0.4,
                  probBTTS: parsed.probBTTS ?? 0.5
                };
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("KI-Ausgabe konnte nicht geparst werden, Standardwerte genutzt.", err);
    }

    return output;
  }
}
