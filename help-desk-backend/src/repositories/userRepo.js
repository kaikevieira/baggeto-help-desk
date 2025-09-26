import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const userRepo = {
  findByUsername: (username) =>
    prisma.user.findUnique({ where: { username } }),

  create: (data) =>
    prisma.user.create({ data }),

  list: (q) =>
    prisma.user.findMany({
      where: q ? { username: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, role: true, createdAt: true }
    })
};
