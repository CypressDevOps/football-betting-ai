// src/services/matchService.ts
import { getUpcomingMatchesForCompetition } from "../api/footballData";
import { getOddsForSportAndRegion, OddsEntry } from "../api/oddsApi";
import { Match } from "../types/types";

/**
 * Gather matches for DE/ES/IT for the upcoming weekend, fetch odds >= 1.8.
 */
export async function gatherMatchData(
  dateFrom?: string,
  dateTo?: string
): Promise<{ matches: Match[]; oddsEntries: OddsEntry[] }> {
  const leagueIds = [
    { id: 2002, name: "Bundesliga" },
    { id: 2014, name: "LaLiga" },
    { id: 2019, name: "SerieA" }
  ];

  const matchesArrays = await Promise.all(
    leagueIds.map((l) =>
      getUpcomingMatchesForCompetition(l.id, dateFrom, dateTo)
    )
  );

  const matches = matchesArrays.flat();

  const oddsEntries: OddsEntry[] = await getOddsForSportAndRegion("soccer", "eu", "h2h", 1.0);

  return { matches, oddsEntries };
}

