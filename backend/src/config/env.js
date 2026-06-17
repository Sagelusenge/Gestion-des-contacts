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
    batchSize: Number(process.env.WHATSAPP_BROADCAST_BATCH_SIZE || 10),
    batchDelayMs: Number(process.env.WHATSAPP_BROADCAST_BATCH_DELAY_MS || 150)
  }
};
