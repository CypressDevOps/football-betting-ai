import { http } from "../util/http.js";
import * as cheerio from "cheerio";
import type { InjuryInfo } from "../types/types";

/**
 * Scrape die Anzahl und Schwere von Verletzungen für einen Club
 * Hinweis: Transfermarkt hat keine offizielle API. Selektoren prüfen!
 */
export async function getInjuriesForClub(injuryPageUrl: string): Promise<InjuryInfo> {
  try {
    const res = await http.get(injuryPageUrl);
    const $ = cheerio.load(res.data);

    let injuredPlayers = 0;
    let injurySeverity = 0;

    $("table.items tr").each((_, el) => {
      const tds = $(el).find("td");
      if (tds.length === 0) return;
      const status = tds.eq(4).text().trim() || tds.eq(5).text().trim();
      if (/long-term|out|doubtful|injur/i.test(status.toLowerCase())) {
        injuredPlayers += 1;
        injurySeverity += /long-term|out/i.test(status.toLowerCase()) ? 1 : 0.5;
      }
    });

    const severityNormalized = injuredPlayers > 0 ? Math.min(1, injurySeverity / injuredPlayers) : 0;

    return {
      teamId: injuryPageUrl,  // hier als Key
      injuredPlayers,
      injurySeverity: severityNormalized
    };
  } catch (err: any) {
    console.warn(`Transfermarkt scrape failed for ${injuryPageUrl}: ${err.message || err}`);
    return { teamId: injuryPageUrl, injuredPlayers: 0, injurySeverity: 0 };
  }
}
