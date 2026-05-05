require('dotenv').config();

const config = {
  app: {
    name: 'CBCA Pastor Management API',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    apiPrefix: process.env.API_PREFIX || '/api/v1'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'cbca_pastors'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },
  
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:5173,http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET is required in environment variables');
}

module.exports = config;
