import { Server } from 'socket.io';
import { logger } from '../config/logger.js';

let io = null;

export const initSockets = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET','POST'] },
  });

  // Auth middleware — verify JWT on connect
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const jwt = (await import('../utils/jwt.js')).verifyAccess(token);
      socket.userId = jwt.sub;
      next();
    } catch { next(new Error('Invalid token')); }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on('join:match',    (matchId) => socket.join(`match:${matchId}`));
    socket.on('join:tournament', (tId)  => socket.join(`tournament:${tId}`));
    socket.on('leave:match',   (matchId) => socket.leave(`match:${matchId}`));

    socket.on('disconnect', () => logger.debug(`Socket disconnected: ${socket.id}`));
  });

  return io;
};

// Helper to emit from controllers
export const emit = (event, payload, room = null) => {
  if (!io) return;
  if (room) io.to(room).emit(event, payload);
  else io.emit(event, payload);
};