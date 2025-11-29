// src/api/transfermarkt.ts
import { http } from "../util/http.js";
import cheerio from "cheerio";
import { InjuryInfo } from "../types/types";

/**
 * Hinweis: Transfermarkt hat keine offizielle API. Scraping ist fragil
 * und kann gegen Nutzungsbedingungen verstoßen. Verwende sparsam und
 * respektiere robots.txt und Rate Limits.
 * Prüfe Selektoren manuell.
 */
export async function getInjuriesForClub(teamId: string, injuryPageUrl: string): Promise<InjuryInfo> {
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
        if (/long-term|out/i.test(status.toLowerCase())) injurySeverity += 1; // schwere Verletzung
        else injurySeverity += 0.5; // leichte Verletzung
      }
    });

    // Normalisiere injurySeverity auf 0..1
    const severityNormalized = injuredPlayers > 0 ? Math.min(1, injurySeverity / injuredPlayers) : 0;

    return {
      teamId,
      injuredPlayers,
      injurySeverity: severityNormalized
    };
  } catch (err: any) {
    throw new Error(`Transfermarkt scrape failed for ${injuryPageUrl}: ${err.message || err}`);
  }
}
