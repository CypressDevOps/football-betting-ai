// src/test/runLiveTest.ts
import { Recommendation, RecommendationService } from "../services/recommendationService";
import { gatherMatchData } from "../services/matchService";
import type { Match } from "../types/types";
import type { OddsEntry } from "../api/oddsApi";
import { calculateTeamForm } from "../services/formService";

const recService = new RecommendationService(1.8, 3); // minOdds = 1.8, topK = 3

// Realistische Formwerte pro Team (0..1)
const recentFormMap: Record<string, number> = {
  "FC Bayern München": 0.9,
  "FC St. Pauli 1910": 0.4,
  "SV Werder Bremen": 0.6,
  "1. FC Köln": 0.5,
  "1. FC Union Berlin": 0.7,
  "1. FC Heidenheim 1846": 0.5,
  "VfB Stuttgart": 0.6,
  "FC Schalke 04": 0.3
};

// Odds extrahieren
interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  over25: number;
  over35: number;
  btts: number;
}

const getOddsForMatch = (matchKey: string, oddsEntries: OddsEntry[]): MatchOdds => {
  const entry = oddsEntries.find(o => o.matchKey === matchKey);

  const fallback: MatchOdds = { home: 1.8, draw: 3, away: 4, over25: 2, over35: 2.2, btts: 1.9 };
  if (!entry) return fallback;

  const odds: MatchOdds = { home: 0, draw: 0, away: 0, over25: 0, over35: 0, btts: 0 };
  const counts: Record<keyof MatchOdds, number> = { home: 0, draw: 0, away: 0, over25: 0, over35: 0, btts: 0 };

  entry.bookmakers.forEach(b => {
    switch (b.outcome) {
      case "Home Win": odds.home += b.price; counts.home++; break;
      case "Draw": odds.draw += b.price; counts.draw++; break;
      case "Away Win": odds.away += b.price; counts.away++; break;
      case "Over 2.5": odds.over25 += b.price; counts.over25++; break;
      case "Over 3.5": odds.over35 += b.price; counts.over35++; break;
      case "Both Teams Score": odds.btts += b.price; counts.btts++; break;
    }
  });

  (Object.keys(odds) as (keyof MatchOdds)[]).forEach(k => {
    odds[k] = counts[k] > 0 ? odds[k] / counts[k] : fallback[k];
  });

  return odds;
};

// MarketSignal berechnen
const calculateMarketSignal = (odds: { home: number; away: number }) =>
  ((1 / odds.home) - (1 / odds.away)) * 0.5;

(async () => {
  try {
    // Aktuelles Wochenende
const today = new Date();
const day = today.getDay(); // 0 = Sonntag, 1 = Montag, ..., 6 = Samstag

// Tage bis Samstag und Sonntag
const daysUntilSaturday = (6 - day + 7) % 7; // korrekt, Samstag
const daysUntilSunday = (7 - day + 7) % 7;   // korrekt, Sonntag

const saturday = new Date(today);
saturday.setDate(today.getDate() + daysUntilSaturday);

const sunday = new Date(today);
sunday.setDate(today.getDate() + daysUntilSunday);

// API-konforme Reihenfolge sicherstellen
const dateFrom = saturday <= sunday ? saturday.toISOString().split("T")[0] : sunday.toISOString().split("T")[0];
const dateTo   = saturday <= sunday ? sunday.toISOString().split("T")[0]   : saturday.toISOString().split("T")[0];


    // Matches & Odds abrufen
    const { matches, oddsEntries } = await gatherMatchData(dateFrom, dateTo);

    // Matches anreichern
    const enrichedMatches: Match[] = matches.map(m => {
      const matchKey = `${m.homeTeam.name} vs ${m.awayTeam.name}`;
      const odds = getOddsForMatch(matchKey, oddsEntries);
      const marketSignal = calculateMarketSignal({ home: odds.home, away: odds.away });

      return {
        ...m,
        odds,
        formHome: recentFormMap[m.homeTeam.name] ?? 0.5,
        formAway: recentFormMap[m.awayTeam.name] ?? 0.5,
        injuriesHome: 0,
        injuriesAway: 0,
        marketSignal
      };
    });

    // Top 3 Picks generieren
    const picks: Recommendation[] = recService.generateRecommendations(enrichedMatches);

    console.log("\n=== TOP 3 WETT-TIPPS DER KI FÜR DAS WOCHENENDE ===\n");
    picks.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.matchKey}`);
      console.log(`   Empfehlung: ${p.betType}`);
      console.log(`   Quote: ${p.odds}`);
      console.log(`   KI-Score: ${(p.kiScore * 100).toFixed(0)} %\n`);
    });

  } catch (err: any) {
    console.error("Fehler beim Abrufen der Live-Daten:", err.message || err);
  }
})();
