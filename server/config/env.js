import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-super-secret-key-pearl-apartments',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  MPESA_CALLBACK_SECRET: process.env.MPESA_CALLBACK_SECRET || 'mpesa-webhook-fallback-secret',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '3306',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'lulu_aurelian',
  // Constructed URL (optional)
  DATABASE_URL: process.env.DATABASE_URL || `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
};

// Check critical variables
if (env.JWT_SECRET === 'fallback-super-secret-key-pearl-apartments' && env.NODE_ENV === 'production') {
  console.warn('[WARNING]: Running in production with fallback JWT Secret Key! Critical security risk.');
}
