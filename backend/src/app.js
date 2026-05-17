import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import broadcastRoutes from './routes/broadcasts.routes.js';
import gradeRoutes from './routes/grades.routes.js';
import pastorRoutes from './routes/pastors.routes.js';
import posteRoutes from './routes/postes.routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cbca-annuaire-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/pastors', pastorRoutes);
app.use('/api/postes', posteRoutes);

app.use(notFound);
app.use(errorHandler);
