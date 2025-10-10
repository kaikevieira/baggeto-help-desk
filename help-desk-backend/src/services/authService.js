import { userRepo } from '../repositories/userRepo.js';
import { tokenRepo } from '../repositories/tokenRepo.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ENV } from '../config/env.js';

export const authService = {
  async register({ username, password }) {
    const exists = await userRepo.findByUsername(username);
    if (exists) {
      const err = new Error('Usuário já existe');
      err.status = 409;
      throw err;
    }
    const passwordHash = await hashPassword(password);
    const user = await userRepo.create({ username, passwordHash });
    return { id: user.id, username: user.username, role: user.role };
  },

  async login({ username, password }) {
  const user = await userRepo.findByUsername(username);
    if (!user) {
      const err = new Error('Credenciais inválidas');
      err.status = 401;
      throw err;
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      const err = new Error('Credenciais inválidas');
      err.status = 401;
      throw err;
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // guarda hash do refresh para revogação
    const decoded = verifyRefreshToken(refreshToken);
    await tokenRepo.storeRefresh(user.id, refreshToken, new Date(decoded.exp * 1000));

  return { accessToken, refreshToken, user: { id: user.id, username: user.username, email: user.email, role: user.role, theme: user.theme } };
  },

  async refresh(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const stored = await tokenRepo.findValid(refreshToken);
    if (!stored || stored.userId !== decoded.sub) {
      const err = new Error('Refresh inválido');
      err.status = 401;
      throw err;
    }

    const payload = { sub: decoded.sub, username: decoded.username, role: decoded.role };
    const accessToken = signAccessToken(payload);
    return { accessToken };
  },

  async logout(refreshToken) {
    if (refreshToken) await tokenRepo.revokeByToken(refreshToken);
    return { ok: true };
  },

  async revokeAll(userId) {
    await tokenRepo.revokeAllForUser(userId);
    return { ok: true };
  }
};
