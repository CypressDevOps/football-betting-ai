// src/api/footballData.ts
import { http } from "../util/http.js";
import { FOOTBALL_DATA_API_KEY } from "../util/env.js";
import { Match } from "../types/types";

const BASE = "https://api.football-data.org/v4";

/**
 * Ruft Matches für eine Competition ab, optional gefiltert nach Zeitraum.
 */
export async function getUpcomingMatchesForCompetition(
  competitionId: number,
  dateFrom?: string, // YYYY-MM-DD
  dateTo?: string    // YYYY-MM-DD
): Promise<Match[]> {
  try {
    const res = await http.get(`${BASE}/competitions/${competitionId}/matches`, {
      headers: { "X-Auth-Token": FOOTBALL_DATA_API_KEY },
      params: {
        dateFrom,
        dateTo
      }
    });

    const matches = (res.data.matches || []).map((m: any) => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,
      homeTeam: { id: m.homeTeam?.id, name: m.homeTeam?.name },
      awayTeam: { id: m.awayTeam?.id, name: m.awayTeam?.name },
      competitionId
    })) as Match[];

    return matches;
  } catch (err: any) {
    throw new Error(`football-data fetch failed for ${competitionId}: ${err.message || err}`);
  }
}
