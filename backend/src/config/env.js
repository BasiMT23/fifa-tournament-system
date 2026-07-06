import dotenv from 'dotenv';
dotenv.config();

// Fail-fast if critical vars are missing — better than runtime errors later
const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_NAME', 'DB_USER'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redisUrl: process.env.REDIS_URL,
  apis: {
    zafronix: process.env.ZAFRONIX_API_BASE,
    sportscore: process.env.SPORTSCORE_API_BASE,
    sofifa: process.env.SOFIFA_API_BASE,
    footballDataKey: process.env.FOOTBALL_DATA_API_KEY,
  },
};