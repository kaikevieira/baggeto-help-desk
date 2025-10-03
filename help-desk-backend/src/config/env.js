import 'dotenv/config';

export const ENV = {
  // Em produção, use 8000 por padrão (Koyeb), a menos que PORT seja explicitamente definido
  PORT: process.env.PORT || (process.env.NODE_ENV === 'production' ? 8000 : 4000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
};
