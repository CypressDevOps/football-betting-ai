// src/mockData.ts
import { Match, InjuryInfo } from "./types/types";

/* -------------------------------------------------------
 * 1) Matches für die drei Ligen inkl. Odds
 * -----------------------------------------------------*/
export const matches: Match[] = [
  {
    id: "101",
    homeTeam: { id: "juv", name: "Juventus", league: "Serie A" },
    awayTeam: { id: "acm", name: "AC Milan", league: "Serie A" },
    date: "2025-12-06",
    odds: {
      home: 1.92,
      draw: 3.40,
      away: 3.80,
      over25: 2.05,
      btts: 1.95
    }
  },
  {
    id: "102",
    homeTeam: { id: "bar", name: "Barcelona", league: "La Liga" },
    awayTeam: { id: "rm", name: "Real Madrid", league: "La Liga" },
    date: "2025-12-06",
    odds: {
      home: 2.25,
      draw: 3.30,
      away: 2.85,
      over25: 1.88,
      btts: 2.15
    }
  },
  {
    id: "103",
    homeTeam: { id: "bmu", name: "Bayern München", league: "Bundesliga" },
    awayTeam: { id: "bdo", name: "Borussia Dortmund", league: "Bundesliga" },
    date: "2025-12-06",
    odds: {
      home: 1.85,
      draw: 3.70,
      away: 4.10,
      over25: 1.65,
      btts: 2.20
    }
  }
];

/* -------------------------------------------------------
 * 2) Verletzungsdaten – InjuryInfo
 * -----------------------------------------------------*/
export const injuriesMap: Record<string, InjuryInfo[]> = {
  "Juventus": [{ teamId: "juv", injuredPlayers: 1, injurySeverity: 0.5 }],
  "AC Milan": [{ teamId: "acm", injuredPlayers: 2, injurySeverity: 0.9 }],
  "Barcelona": [{ teamId: "bar", injuredPlayers: 1, injurySeverity: 0.6 }],
  "Real Madrid": [{ teamId: "rm", injuredPlayers: 2, injurySeverity: 0.8 }],
  "Bayern München": [{ teamId: "bmu", injuredPlayers: 1, injurySeverity: 0.5 }],
  "Borussia Dortmund": [{ teamId: "bdo", injuredPlayers: 1, injurySeverity: 0.6 }]
};

/* -------------------------------------------------------
 * 3) Form-Daten – normalized 0..1
 * -----------------------------------------------------*/
export const recentFormMap: Record<string, number> = {
  "Juventus": 0.72,
  "AC Milan": 0.58,
  "Barcelona": 0.81,
  "Real Madrid": 0.77,
  "Bayern München": 0.67,
  "Borussia Dortmund": 0.61
};
