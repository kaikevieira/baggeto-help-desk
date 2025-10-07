import 'dotenv/config';

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Porta padrão: 4000 em desenvolvimento, 8000 em produção (override por PORT)
  PORT: process.env.PORT || ((process.env.NODE_ENV || 'development') === 'production' ? 8000 : 4000),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
};
