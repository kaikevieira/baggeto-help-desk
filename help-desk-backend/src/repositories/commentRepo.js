import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const commentRepo = {
  add: (data) => prisma.comment.create({ data }),
  listByTicket: (ticketId) =>
    prisma.comment.findMany({
      where: { ticketId },
      include: { author: { select: { id: true, username: true, fullName: true } } },
      orderBy: { createdAt: 'asc' }
    })
};
