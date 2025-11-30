// src/services/matchService.ts
import { getUpcomingMatchesForCompetition } from "../api/footballData";
import { getOddsForSportAndRegion, OddsEntry } from "../api/oddsApi";
import type { Match } from "../types/types";
import { calculateTeamForm } from "./formService";

export async function gatherMatchData(
  dateFrom?: string,
  dateTo?: string
): Promise<{ matches: Match[]; oddsEntries: OddsEntry[] }> {
  const leagues = [
    { id: 2002, name: "Bundesliga" },
    { id: 2014, name: "LaLiga" },
    { id: 2021, name: "Premier League" }
  ];

  // 1️⃣ Alle Liga-Matches parallel abrufen
  const matchesArrays = await Promise.all(
    leagues.map(async (league) => {
      try {
        console.log(`Fetching matches: https://api.football-data.org/v4/competitions/${league.id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`);
        const matchesForLeague = await getUpcomingMatchesForCompetition(league.id, dateFrom, dateTo);
        return matchesForLeague;
      } catch (err: any) {
        console.error(`Fehler beim Abrufen der Matches für ${league.name}:`, err.message || err);
        return [];
      }
    })
  );

  const matches = matchesArrays.flat();

  // 2️⃣ Odds abrufen
  let oddsEntries: OddsEntry[] = [];
  try {
    oddsEntries = await getOddsForSportAndRegion("soccer", "eu", "h2h", 1.8);
  } catch (err: any) {
    console.error("Fehler beim Abrufen der Odds:", err.message || err);
  }

  // 3️⃣ Form für jedes Team berechnen
  for (const m of matches) {
    m.formHome = calculateTeamForm(m.homeTeam.name, matches);
    m.formAway = calculateTeamForm(m.awayTeam.name, matches);
    m.marketSignal = 0; // neutral, da Verletzungen nicht verfügbar
  }

  return { matches, oddsEntries };
}
