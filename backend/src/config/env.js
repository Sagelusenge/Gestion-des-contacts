import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'cbca_app',
    password: process.env.DB_PASSWORD || 'cbca_password',
    database: process.env.DB_NAME || 'cbca_annuaire'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_before_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
