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
      const isProd = ENV.NODE_ENV === 'production';
      // Domínio do cookie só deve ser definido se pertencer ao próprio host da API
      const cookieDomain = ENV.COOKIE_DOMAIN;
      const domain = cookieDomain && req.hostname.endsWith(cookieDomain) ? cookieDomain : undefined;
      const baseCookie = {
        httpOnly: true,
        secure: isProd || ENV.COOKIE_SECURE, // exige HTTPS quando em produção
        sameSite: isProd ? 'none' : 'lax',   // para permitir cross-site em prod
        path: '/',
        domain,
      };
      res
        .cookie('access_token', accessToken, { ...baseCookie, maxAge: 1000 * 60 * 15 })
        .cookie('refresh_token', refreshToken, { ...baseCookie, maxAge: 1000 * 60 * 60 * 24 * 7 })
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

      const isProd = ENV.NODE_ENV === 'production';
      const cookieDomain = ENV.COOKIE_DOMAIN;
      const domain = cookieDomain && req.hostname.endsWith(cookieDomain) ? cookieDomain : undefined;
      const baseCookie = {
        httpOnly: true,
        secure: isProd || ENV.COOKIE_SECURE,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        domain,
      };
      res.cookie('access_token', accessToken, { ...baseCookie, maxAge: 1000 * 60 * 15 }).json({ ok: true });
    } catch (e) {
      next(e);
    }
  },

  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refresh_token;
      await authService.logout(refreshToken);

      const isProd = ENV.NODE_ENV === 'production';
      const cookieDomain = ENV.COOKIE_DOMAIN;
      const domain = cookieDomain && req.hostname.endsWith(cookieDomain) ? cookieDomain : undefined;
      const clearOpts = {
        httpOnly: true,
        secure: isProd || ENV.COOKIE_SECURE,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        domain,
      };
      res.clearCookie('access_token', clearOpts);
      res.clearCookie('refresh_token', clearOpts);
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
