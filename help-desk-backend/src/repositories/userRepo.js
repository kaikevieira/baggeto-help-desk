// src/repositories/userRepo.js
import { prisma } from '../db.js';

export const userRepo = {
  // Agora inclui passwordHash para o fluxo de login
  findByUsername: (username) =>
    prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, role: true, createdAt: true, passwordHash: true },
    }),

  create: (data) =>
    prisma.user.create({
      data,
      select: { id: true, username: true, role: true, createdAt: true },
    }),

  update: (id, data) =>
    prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, role: true, createdAt: true },
    }),

  list: (q) =>
    prisma.user.findMany({
      where: q ? { username: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, role: true, createdAt: true },
    }),
};
