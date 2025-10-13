import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const ticketRepo = {
  create: (data) => prisma.ticket.create({ data }),
  findById: (id) =>
    prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true, fullName: true } },
        assignedTo: { select: { id: true, username: true, fullName: true } },
        comments: {
          include: { author: { select: { id: true, username: true, fullName: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    }),
  update: (id, data) => prisma.ticket.update({ where: { id }, data }),
  remove: (id) => prisma.ticket.delete({ where: { id } }),
  list: ({ page = 1, pageSize = 10, status, q }) => {
    const skip = (page - 1) * pageSize;
    return prisma.$transaction([
      prisma.ticket.count({
        where: {
          AND: [
            status ? { status } : {},
            q
              ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] }
              : {}
          ]
        }
      }),
      prisma.ticket.findMany({
        where: {
          AND: [
            status ? { status } : {},
            q
              ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] }
              : {}
          ]
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          createdBy: { select: { id: true, username: true, fullName: true } },
          assignedTo: { select: { id: true, username: true, fullName: true } }
        }
      })
    ]);
  }
};
