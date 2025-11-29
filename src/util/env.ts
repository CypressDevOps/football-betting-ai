// src/util/env.ts
import dotenv from "dotenv";
dotenv.config();

export const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`${key} missing in .env`);
  return v;
};

export const FOOTBALL_DATA_API_KEY = requireEnv("FOOTBALL_DATA_API_KEY");
export const ODDS_API_KEY = requireEnv("ODDS_API_KEY");
