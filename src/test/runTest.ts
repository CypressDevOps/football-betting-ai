// src/test/runLiveTest.ts
import { Recommendation, RecommendationService } from "../services/recommendationService";
import { gatherMatchData } from "../services/matchService";
import type { Match } from "../types/types";
import type { OddsEntry } from "../api/oddsApi";

const recService = new RecommendationService();

// Optional: Formwerte pro Team (0..1). Kann durch Analyse ersetzt werden
const recentFormMap: Record<string, number> = {};

// Odds für MatchKey extrahieren
const getOddsForMatch = (matchKey: string, oddsEntries: OddsEntry[]) => {
  const entry = oddsEntries.find(o => o.matchKey === matchKey);
  if (!entry) {
    // Neutral-Fallback, nur wenn keine API-Daten vorhanden
    return { home: 1.8, draw: 3, away: 4, over25: 2, btts: 1.9 };
  }

  const odds: { home: number; draw: number; away: number; over25: number; btts: number } = {
    home: 1.8,
    draw: 3,
    away: 4,
    over25: 2,
    btts: 1.9
  };

  entry.bookmakers.forEach(b => {
    switch (b.outcome) {
      case "Home Win": odds.home = b.price; break;
      case "Draw": odds.draw = b.price; break;
      case "Away Win": odds.away = b.price; break;
      case "Over 2.5": odds.over25 = b.price; break;
      case "Both Teams Score": odds.btts = b.price; break;
    }
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
    const day = today.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    const daysUntilSunday = (7 - day + 7) % 7;

    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);

    const dateFrom = saturday.toISOString().split("T")[0];
    const dateTo = sunday.toISOString().split("T")[0];

    // Live Matches abrufen (alle drei Ligen)
    const { matches, oddsEntries } = await gatherMatchData(dateFrom, dateTo);

    // Matches anreichern (ohne Verletzungen)
    const enrichedMatches: Match[] = matches.map(m => {
      const matchKey = `${m.homeTeam.name} vs ${m.awayTeam.name}`;
      const odds = getOddsForMatch(matchKey, oddsEntries);
      
      // MarketSignal leicht randomisieren, falls gleiche Odds
      const marketSignal = calculateMarketSignal(odds) + (Math.random() - 0.5) * 0.05;

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

    // DEBUG: Alle Matches & Odds prüfen
    console.log("=== DEBUG Matches & Odds ===");
    enrichedMatches.forEach(m => {
      console.log(`${m.homeTeam.name} vs ${m.awayTeam.name}`);
      console.log(` Odds: home=${m.odds.home}, draw=${m.odds.draw}, away=${m.odds.away}, over25=${m.odds.over25}, btts=${m.odds.btts}`);
      console.log(` Form: ${m.formHome} vs ${m.formAway}`);
console.log(` MarketSignal: ${(m.marketSignal ?? 0).toFixed(3)}`);

    });

    // Top 3 Picks generieren
    const picks: Recommendation[] = recService.generateRecommendations(
      enrichedMatches,
      1.0, // minOdds auf 1.0, damit auch Favoriten berücksichtigt werden
      3    // Top 3 Picks
    );

    console.log("\n=== TOP 3 WETT-TIPPS DER KI FÜR DAS WOCHENENDE ===\n");
    picks.forEach((p: Recommendation, idx: number) => {
      console.log(`${idx + 1}. ${p.matchKey}`);
      console.log(`   Empfehlung: ${p.betType}`);
      console.log(`   Quote: ${p.odds}`);
      console.log(`   Over 2.5: ${p.over25}`);
      console.log(`   BTTS: ${p.btts}`);
      console.log(`   KI-Score: ${(p.kiScore * 100).toFixed(0)} %`);
    });

  } catch (err: any) {
    console.error("Fehler beim Abrufen der Live-Daten:", err.message || err);
  }
})();
