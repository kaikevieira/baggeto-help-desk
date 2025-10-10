// src/repositories/userRepo.js
import { prisma } from '../db.js';

export const userRepo = {
  // Agora inclui passwordHash para o fluxo de login
  findByUsername: (username) =>
    prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, email: true, role: true, theme: true, createdAt: true, passwordHash: true },
    }),

  create: (data) =>
    prisma.user.create({
      data,
      select: { id: true, username: true, email: true, role: true, theme: true, createdAt: true },
    }),

  update: (id, data) =>
    prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, email: true, role: true, theme: true, createdAt: true },
    }),

  list: (q) =>
    prisma.user.findMany({
      where: q ? { username: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, theme: true, createdAt: true },
    }),
  findById: (id) => prisma.user.findUnique({ where: { id }, select: { id: true, username: true, email: true, role: true, theme: true } }),
  updateTheme: (id, theme) =>
    prisma.user.update({ where: { id }, data: { theme }, select: { id: true, username: true, email: true, role: true, theme: true } }),
};
