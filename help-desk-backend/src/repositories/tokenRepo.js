import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const tokenRepo = {
  storeRefresh: (userId, token, expiresAt) =>
    prisma.refreshToken.create({
      data: { userId, tokenHash: hashToken(token), expiresAt }
    }),

  revokeAllForUser: (userId) =>
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    }),

  findValid: (token) =>
    prisma.refreshToken.findFirst({
      where: { tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } }
    }),

  revokeByToken: (token) =>
    prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() }
    })
};
