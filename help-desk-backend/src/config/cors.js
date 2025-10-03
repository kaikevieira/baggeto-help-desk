import cors from 'cors';
import { ENV } from './env.js';

// Aceita uma string única ou uma lista separada por vírgulas em CLIENT_URL
const allowedOrigins = (ENV.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // permitir requests sem origin (ex.: curl)
    if (allowedOrigins.length === 0) return callback(null, true);
    const ok = allowedOrigins.includes(origin);
    callback(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
});
