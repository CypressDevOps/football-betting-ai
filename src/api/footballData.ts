// src/api/footballData.ts
import axios from "axios";
import { FOOTBALL_DATA_API_KEY } from "../util/env.js";
import type { Match } from "../types/types";

export async function getUpcomingMatchesForCompetition(
  competitionId: number,
  dateFrom?: string,
  dateTo?: string
): Promise<Match[]> {
  try {
    const url = `https://api.football-data.org/v4/competitions/${competitionId}/matches`;
    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    console.log(`Fetching matches: ${url}?${new URLSearchParams(params).toString()}`);

    const res = await axios.get(url, {
      headers: { "X-Auth-Token": FOOTBALL_DATA_API_KEY },
      params
    });

    const data = res.data?.matches || [];

    return data.map((m: any) => ({
      id: m.id.toString(),
      utcDate: m.utcDate,
      status: m.status,
      homeTeam: { id: m.homeTeam.id?.toString(), name: m.homeTeam.name },
      awayTeam: { id: m.awayTeam.id?.toString(), name: m.awayTeam.name },
      score: m.score ? { fullTime: { home: m.score.fullTime?.home ?? 0, away: m.score.fullTime?.away ?? 0 } } : undefined,
      competitionId: competitionId
    }));
  } catch (err: any) {
    throw new Error(
      `football-data fetch failed for ${competitionId}: ${err.response?.status} ${err.response?.data?.message || err.message}`
    );
  }
}
