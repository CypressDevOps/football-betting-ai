import { KiPrediction } from "../services/kiPredictionService";

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

// src/types/types.ts
export interface Match {
  id: string;
  utcDate?: string;
  status?: string;
  date?: string;

  homeTeam: { id?: string; name: string; league?: string };
  awayTeam: { id?: string; name: string; league?: string };

  score?: { fullTime: { home: number; away: number } };
  competitionId?: number;

  odds?: MatchOdds;          // OddsAPI-Daten
  formHome?: number;         // berechnete Form
  formAway?: number;
  marketSignal?: number;     // Markt- oder Verletzungs-Signal
  homeTeamAdvantage?: number; // optional, z.B. 0.1 für Heimteam

  // Modelle / KI-Scores
  kiPrediction?: KiPrediction; // optional, aus KiPredictionService
  scoreOver25?: number;   
  scoreOver35?: number;   
  scoreBTTS?: number;       // neu
  scoreHomeWin?: number;    // neu
}



// src/types/types.ts (oder direkt in runLiveTest.ts)
export interface MatchOdds {
  home: number;
  away: number;
  draw: number;
  over25: number;
  over35: number;
  btts: number;
}

