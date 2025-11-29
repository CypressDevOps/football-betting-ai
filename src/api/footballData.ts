// src/api/footballData.ts
import { http } from "../util/http.js";
import { FOOTBALL_DATA_API_KEY } from "../util/env.js";
import { Match } from "../types/types.js";

const BASE = "https://api.football-data.org/v4";

export async function getUpcomingMatchesForCompetition(competitionId: number): Promise<Match[]> {
  try {
    const res = await http.get(`${BASE}/competitions/${competitionId}/matches`, {
      headers: { "X-Auth-Token": FOOTBALL_DATA_API_KEY },
      params: {
        // optional: dateFrom/dateTo
      }
    });

    const matches: Match[] = (res.data.matches || []).map((m: any) => ({
      id: m.id,
      date: m.utcDate,
      homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, league: "" },
      awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, league: "" },
      odds: {
        home: null,
        draw: null,
        away: null,
        over25: null,
        btts: null,
      }
    }));

    return matches;
  } catch (err: any) {
    throw new Error(`football-data fetch failed for competition ${competitionId}: ${err.message || err}`);
  }
}
