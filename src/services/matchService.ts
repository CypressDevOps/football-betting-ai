// src/services/matchService.ts
import { getUpcomingMatchesForCompetition } from "../api/footballData";
import { getOddsForSportAndRegion, OddsEntry } from "../api/oddsApi";
import { Match } from "../types/types";

/**
 * Gather matches for DE/ES/UK for the upcoming weekend, fetch odds >= 1.8.
 */
export async function gatherMatchData(
  dateFrom?: string,
  dateTo?: string
): Promise<{ matches: Match[]; oddsEntries: OddsEntry[] }> {
  // v4-kompatible Liga-IDs
  const leagues = [
    { id: 2002, name: "Bundesliga" },
    { id: 2014, name: "LaLiga" },
    { id: 2021, name: "Premier League" } // vorher Serie A
  ];

  const matchesArrays: Match[][] = [];

  for (const league of leagues) {
    try {
      const url = `https://api.football-data.org/v4/competitions/${league.id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      console.log(`Fetching matches: ${url}`);
      const matchesForLeague = await getUpcomingMatchesForCompetition(league.id, dateFrom, dateTo);
      matchesArrays.push(matchesForLeague);
    } catch (err: any) {
      console.error(`Fehler beim Abrufen der Matches für ${league.name} (${league.id}):`, err.message || err);
    }
  }

  const matches = matchesArrays.flat();

  // Odds abrufen
  let oddsEntries: OddsEntry[] = [];
  try {
    oddsEntries = await getOddsForSportAndRegion("soccer", "eu", "h2h", 1.8);
  } catch (err: any) {
    console.error("Fehler beim Abrufen der Odds:", err.message || err);
  }

  return { matches, oddsEntries };
}
