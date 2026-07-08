import axios from 'axios';
import { env } from '../config/env.js';
import { cacheService } from './cacheService.js';
import { logger } from '../config/logger.js';

// Simple per-API rate limit counters (persisted in Redis in production)
const apiCalls = { zafronix: { count: 0, day: new Date().toDateString() } };

function checkLimit(name, max) {
  const today = new Date().toDateString();
  if (apiCalls[name].day !== today) {
    apiCalls[name] = { count: 0, day: today };
  }
  if (apiCalls[name].count >= max) {
    throw new Error(`Rate limit reached for ${name}`);
  }
  apiCalls[name].count++;
}

export const apiService = {
  /**
   * Zafronix historical data — cached 1 hour (data is immutable).
   */
  async getHistoricalBracket(year) {
    const cacheKey = `zafronix:bracket:${year}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) { logger.debug(`Cache hit: ${cacheKey}`); return cached; }

    checkLimit('zafronix', 1000);
    try {
      const { data } = await axios.get(`${env.apis.zafronix}/bracket`, {
        params: { year },
        timeout: 5000,
      });
      await cacheService.set(cacheKey, data, 3600);
      return data;
    } catch (e) {
      logger.error(`Zafronix API failed: ${e.message}`);
      throw new Error('Historical data unavailable');
    }
  },

  /**
   * SportScore live scores — short cache (30s) because data updates.
   */
  async getLiveMatchStats(matchId) {
    const cacheKey = `sportscore:match:${matchId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    checkLimit('sportscore', 10000);
    const { data } = await axios.get(`${env.apis.sportscore}/matches/${matchId}/stats`, {
      timeout: 5000,
    });
    await cacheService.set(cacheKey, data, 30);
    return data;
  },

  /**
   * SoFIFA player ratings — cached 24h (ratings rarely change).
   */
  async getPlayerRatings() {
    const cacheKey = 'sofifa:ratings';
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const { data } = await axios.get(`${env.apis.sofifa}/players`, { timeout: 10000 });
    await cacheService.set(cacheKey, data, 86400);
    return data;
  },

  /**
   * football-data.org — needs API key.
   */
  async getFixtures(competition = 'PL') {
    const cacheKey = `fdata:${competition}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const { data } = await axios.get(`https://api.football-data.org/v4/competitions/${competition}/matches`, {
      headers: { 'X-Auth-Token': env.apis.footballDataKey },
      timeout: 5000,
    });
    await cacheService.set(cacheKey, data, 60);
    return data;
  },
};