// src/util/matchUtils.ts
import type { Match, MatchOdds } from "../types/types";
import type { OddsEntry } from "../api/oddsApi";

export function getWeekendDates(): { saturday: Date; sunday: Date } {
  const today = new Date();
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const daysUntilSunday = (7 - day + 7) % 7;

  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);

  const sunday = new Date(today);
  sunday.setDate(today.getDate() + daysUntilSunday);

  return { saturday, sunday };
}

const getOddsForMatch = (matchKey: string, oddsEntries: OddsEntry[]): MatchOdds => {
  const entry = oddsEntries.find(o => o.matchKey === matchKey);

  if (!entry) {
    return { home: 1.8, draw: 3, away: 4, over25: 2, over35: 2.2, btts: 1.9 };
  }

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

  // Durchschnitt bilden
  for (const k of Object.keys(odds) as (keyof MatchOdds)[]) {
    if (counts[k] > 0) odds[k] /= counts[k];
    else odds[k] = { home: 1.8, draw: 3, away: 4, over25: 2, over35: 2.2, btts: 1.9 }[k];
  }

  return odds;
};


export function calculateMarketSignal(odds: { home: number; away: number }) {
  return ((1 / odds.home) - (1 / odds.away)) * 0.5;
}

export function enrichMatches(matches: Match[], oddsEntries: OddsEntry[], recentFormMap: Record<string, number>): Match[] {
  return matches.map(m => {
    const matchKey = `${m.homeTeam.name} vs ${m.awayTeam.name}`;
    interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  over25: number;
  over35: number;
  btts: number;
}

// Odds extrahieren
const odds: MatchOdds = getOddsForMatch(matchKey, oddsEntries);

if (m.odds && m.odds.home !== undefined && m.odds.away !== undefined) {
  const marketSignal = calculateMarketSignal({ home: m.odds.home, away: m.odds.away });
} else {
  // Fallback, falls Odds fehlen
  const marketSignal = 0;
}

// MarketSignal berechnen
const marketSignal = calculateMarketSignal({
  home: m.odds?.home ?? 1.8,
  away: m.odds?.away ?? 2.0
});


 // keine Randomisierung


    return {
      ...m,
      odds: { ...odds },
      formHome: recentFormMap[m.homeTeam.name] ?? 0.5,
      formAway: recentFormMap[m.awayTeam.name] ?? 0.5,
      injuriesHome: 0,
      injuriesAway: 0,
      marketSignal
    };
  });
}

export function printTopPicks(picks: { matchKey: string; betType: string; odds: number; kiScore: number }[]) {
  console.log("\n=== TOP 3 WETT-TIPPS DER KI FÜR DAS WOCHENENDE ===\n");
  picks.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.matchKey}`);
    console.log(`   Empfehlung: ${p.betType}`);
    console.log(`   Quote: ${p.odds}`);
    console.log(`   KI-Score: ${(p.kiScore * 100).toFixed(0)} %\n`);
  });
}
