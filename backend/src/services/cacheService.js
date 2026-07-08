import { createClient } from 'redis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let redisClient = null;

// Redis is optional — fall back to in-memory Map so dev still works.
const inMemory = new Map();

export const cacheService = {
  async init() {
    if (!env.redisUrl) return;
    try {
      redisClient = createClient({ url: env.redisUrl });
      redisClient.on('error', (e) => logger.warn(`Redis error: ${e.message}`));
      await redisClient.connect();
      logger.info('Redis connected');
    } catch (e) {
      logger.warn(`Redis unavailable, using in-memory cache: ${e.message}`);
      redisClient = null;
    }
  },

  async get(key) {
    if (redisClient) {
      const v = await redisClient.get(key);
      return v ? JSON.parse(v) : null;
    }
    const entry = inMemory.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { inMemory.delete(key); return null; }
    return entry.value;
  },

  async set(key, value, ttlSeconds = 300) {
    if (redisClient) {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } else {
      inMemory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
  },
};