const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const pasteurRoutes = require('./routes/pasteurs');
const geographieRoutes = require('./routes/geographie');
const mouvementRoutes = require('./routes/mouvements');
const dashboardRoutes = require('./routes/dashboard');
const auditRoutes = require('./routes/audit');
const messageRoutes = require('./routes/messages');

const app = express();

app.use(helmet());
app.use(cors(config.cors));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});
app.use('/api/v1/auth', limiter);

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'CBCA Pastor Management API',
    version: config.app.version,
    docs: `${config.app.apiPrefix}/docs`
  });
});

app.use(`${config.app.apiPrefix}/auth`, authRoutes);
app.use(`${config.app.apiPrefix}/pasteurs`, authMiddleware, pasteurRoutes);
app.use(`${config.app.apiPrefix}/geographie`, authMiddleware, geographieRoutes);
app.use(`${config.app.apiPrefix}/mouvements`, authMiddleware, mouvementRoutes);
app.use(`${config.app.apiPrefix}/dashboard`, authMiddleware, dashboardRoutes);
app.use(`${config.app.apiPrefix}/audit`, authMiddleware, auditRoutes);
app.use(`${config.app.apiPrefix}/messages`, authMiddleware, messageRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route non trouvée'
    }
  });
});

app.use(errorHandler);

module.exports = app;
