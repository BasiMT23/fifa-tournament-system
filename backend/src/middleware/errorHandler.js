import { logger } from '../config/logger.js';

// 404 handler
export const notFound = (req, res, next) => {
  res.status(404).json({ error: 'Resource not found', path: req.path });
};

// Centralized error handler — keeps controller code clean
export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  if (err.isJoi) {
    return res.status(422).json({ error: 'Validation error', details: err.details });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};