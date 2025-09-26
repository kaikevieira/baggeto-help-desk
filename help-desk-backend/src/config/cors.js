import cors from 'cors';
import { ENV } from './env.js';

export const corsMiddleware = cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
});
