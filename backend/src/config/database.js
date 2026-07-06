import pg from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

const pool = new pg.Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: 20,                // max concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PG client', err);
  process.exit(-1);
});

// Helper: query + log slow queries for performance debugging
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 200) {
      logger.warn(`Slow query (${duration}ms): ${text}`);
    }
    return res;
  } catch (err) {
    logger.error(`Query error: ${text} — ${err.message}`);
    throw err;
  }
};

export const getClient = () => pool.connect(); // for transactions
export default pool;