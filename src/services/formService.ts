// src/services/formService.ts
import type { Match } from "../types/types";

/**
 * Berechnet die Form eines Teams auf Basis der letzten 5 Spiele.
 * Rückgabewert: 0..1 (0 = keine Siege, 1 = alle 5 Siege)
 */
export function calculateTeamForm(teamName: string, matches: Match[]): number {
  // Filter nur Matches, an denen das Team beteiligt war
  const recentMatches = matches
    .filter(m => m.homeTeam.name === teamName || m.awayTeam.name === teamName)
    .slice(-5); // letzte 5 Spiele

  if (recentMatches.length === 0) return 0.5; // neutral fallback

  let wins = 0;

  recentMatches.forEach(m => {
    const homeScore = m.score?.fullTime.home ?? 0;
    const awayScore = m.score?.fullTime.away ?? 0;

    if (m.homeTeam.name === teamName && homeScore > awayScore) wins++;
    if (m.awayTeam.name === teamName && awayScore > homeScore) wins++;
  });

  return wins / 5; // Wert zwischen 0 und 1
}
