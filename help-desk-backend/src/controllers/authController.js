import { z } from 'zod';
import { authService } from '../services/authService.js';
import { ENV } from '../config/env.js';

const authSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(3)
  })
});

export const authController = {
  validateAuth: authSchema,

  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  login: async (req, res, next) => {
    try {
      const { accessToken, refreshToken, user } = await authService.login(req.body);

      // cookies httpOnly
      res
        .cookie('access_token', accessToken, {
          httpOnly: true,
          secure: ENV.COOKIE_SECURE,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 15
        })
        .cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: ENV.COOKIE_SECURE,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7
        })
        .json({ user });
    } catch (e) {
      next(e);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) return res.status(401).json({ message: 'Sem refresh' });

      const { accessToken } = await authService.refresh(refreshToken);

      res
        .cookie('access_token', accessToken, {
          httpOnly: true,
          secure: ENV.COOKIE_SECURE,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 15
        })
        .json({ ok: true });
    } catch (e) {
      next(e);
    }
  },

  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refresh_token;
      await authService.logout(refreshToken);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  },

  me: async (req, res, next) => {
    try {
      // req.user já está disponível através do middleware requireAuth
      const { sub, username, role } = req.user;
      res.json({ 
        user: { 
          id: sub, 
          username, 
          role 
        } 
      });
    } catch (e) {
      next(e);
    }
  }
};
