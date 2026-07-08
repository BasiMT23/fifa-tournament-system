import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initSockets } from './sockets/index.js';
import { startCronJobs } from './services/cronService.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);
initSockets(server);
startCronJobs();

server.listen(env.port, () => {
  logger.info(`🚀 Server running on port ${env.port} in ${env.nodeEnv} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});