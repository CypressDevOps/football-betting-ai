export interface Team {
  id: string;
  name: string;
  league: string;
}

export interface Odds {
  home: number | null;
  draw: number | null;
  away: number | null;
  over25: number | null;
  btts: number | null;
}

export interface InjuryInfo {
  teamId: string;
  injuredPlayers: number;    // absolute Zahl
  injurySeverity: number;    // 0..1 normalisiert
}

export interface Form {
  teamId: string;
  value: number;             // 0..1 normalisiert
}

export interface Match {
  id: string;
  date?: string;
  homeTeam: { id?: string; name: string; league?: string };
  awayTeam: { id?: string; name: string; league?: string };
  odds?: any;           // später füllen
  formHome?: number;
  formAway?: number;
  injuriesHome?: number;
  injuriesAway?: number;
  marketSignal?: number;
}

