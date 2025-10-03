import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './config/cors.js';
import { errorHandler } from './middlewares/error.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));
// Root route (some platforms ping '/')
app.get('/', (_req, res) => res.status(200).send('OK'));

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/dashboard', dashboardRoutes);

// Error handler central
app.use(errorHandler);

export default app;
