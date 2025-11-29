// src/services/matchService.ts
import { getUpcomingMatchesForCompetition } from "../api/footballData";
import { getOddsForSportAndRegion, OddsEntry } from "../api/oddsApi";
import type { Match } from "../types/types";

/**
 * Hole Matches der drei Ligen (DE/ES/IT) und dazu passende Odds.
 */
export async function gatherMatchData(): Promise<{ matches: Match[]; oddsEntries: OddsEntry[] }> {
  const leagueIds = [
    { id: 2002, name: "Bundesliga" },
    { id: 2014, name: "LaLiga" },
    { id: 2019, name: "SerieA" }
  ];

  // Matches parallel abrufen
  const matchesArrays = await Promise.all(
    leagueIds.map(l => getUpcomingMatchesForCompetition(l.id))
  );
  const matches = matchesArrays.flat();

  // Odds abrufen (Minimum-Quote 1.8)
  const oddsEntries: OddsEntry[] = await getOddsForSportAndRegion("soccer", "eu", "h2h", 1.8);

  return { matches, oddsEntries };
}
