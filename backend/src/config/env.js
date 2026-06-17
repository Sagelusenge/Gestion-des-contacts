import dotenv from 'dotenv';

dotenv.config();

const dbPort = process.env.DB_PORT || process.env.MYSQL_ADDON_PORT || 3306;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5002),
  db: {
    host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST || 'localhost',
    port: Number(dbPort),
    user: process.env.DB_USER || process.env.MYSQL_ADDON_USER || 'uzxt4twiqrh7iil1',
    password: process.env.DB_PASSWORD || process.env.MYSQL_ADDON_PASSWORD || 'pPutmK0QG0XfRHEWfVrz',
    database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB || 'b85jiaxlyy1unpxaj0m5'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_before_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION || 'v23.0',
    webAuthPath: process.env.WHATSAPP_WEB_AUTH_PATH || '',
    browserExecutablePath: process.env.WHATSAPP_BROWSER_EXECUTABLE_PATH || '',
    startupTimeoutMs: Number(process.env.WHATSAPP_WEB_STARTUP_TIMEOUT_MS || 60000),
    idleShutdownMs: Number(process.env.WHATSAPP_WEB_IDLE_SHUTDOWN_MS || 30000),
    maxRecipientsPerBroadcast: Number(process.env.WHATSAPP_MAX_RECIPIENTS_PER_BROADCAST || 50),
    batchSize: Number(process.env.WHATSAPP_BROADCAST_BATCH_SIZE || 1),
    batchDelayMs: Number(process.env.WHATSAPP_BROADCAST_BATCH_DELAY_MS || 8000)
  }
};
