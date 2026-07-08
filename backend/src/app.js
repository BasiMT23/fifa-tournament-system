import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import authRoutes from './routes/authRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import fantasyRoutes from './routes/fantasyRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

import { globalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';
import { cacheService } from './services/cacheService.js';

const app = express();

// ---- Security middleware ----
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Logging ----
app.use(morgan('combined', { stream: { write: m => logger.http(m.trim()) } }));
app.use(globalLimiter);

// ---- Routes ----
app.use('/api/auth',          authLimiter, authRoutes);
app.use('/api/tournaments',   tournamentRoutes);
app.use('/api/matches',       matchRoutes);
app.use('/api/predictions',   predictionRoutes);
app.use('/api/fantasy',       fantasyRoutes);
app.use('/api/comments',      commentRoutes);

// ---- Swagger docs ----
const swaggerDoc = YAML.load('./docs/openapi.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ---- Health ----
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use(notFound);
app.use(errorHandler);

// Warm cache
cacheService.init();

export default app;