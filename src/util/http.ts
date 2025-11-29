// src/util/http.ts
import axios, { AxiosInstance } from "axios";

const createHttp = (): AxiosInstance => {
  const inst = axios.create({
    timeout: 10000,
    headers: {
      "User-Agent": "football-betting-ai/1.0 (+https://your.domain/)"
    }
  });

  // einfacher Retry-Interceptor (3 Versuche)
  inst.interceptors.response.use(undefined, async (error) => {
    const config = error.config;
    if (!config) throw error;
    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= 2) {
      throw error;
    }
    config.__retryCount += 1;
    await new Promise((r) => setTimeout(r, 500 * config.__retryCount)); // backoff
    return inst(config);
  });

  return inst;
};

export const http = createHttp();
