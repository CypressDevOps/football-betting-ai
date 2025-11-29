// src/api/oddsApi.ts
import { http } from "../util/http.js";
import { ODDS_API_KEY } from "../util/env.js";

export interface OddsEntry {
  matchKey: string;
  bookmakers: { outcome: string; price: number }[];
}

export async function getOddsForSportAndRegion(
  sport = "soccer_epl",
  regions = "eu",
  markets = "h2h",
  minOdd = 1.8
): Promise<OddsEntry[]> {
  try {
    const res = await http.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds`, {
      params: { apiKey: ODDS_API_KEY, regions, markets }
    });

    const data = res.data || [];
    const entries: OddsEntry[] = [];

    data.forEach((item: any) => {
      const matchKey = `${item.home_team} vs ${item.away_team}`;
      const bookmakers: { outcome: string; price: number }[] = [];

      (item.bookmakers || []).forEach((b: any) => {
        (b.markets || []).forEach((m: any) => {
          (m.outcomes || []).forEach((o: any) => {
            const price = Number(o.price);
            if (!isNaN(price) && price >= minOdd) {
              bookmakers.push({
                outcome: o.name,
                price
              });
            }
          });
        });
      });

      if (bookmakers.length) entries.push({ matchKey, bookmakers });
    });

    return entries;
  } catch (err: any) {
    throw new Error(`odds-api fetch failed: ${err.message || err}`);
  }
}
