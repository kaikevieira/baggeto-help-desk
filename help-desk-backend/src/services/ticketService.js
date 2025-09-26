import { prisma } from '../db.js';

export const ticketService = {
  create: async (data) => {
    return prisma.ticket.create({
      data,
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });
  },

  list: async ({ page = 1, pageSize = 10, status, q }) => {
    const where = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { originCity: { contains: q, mode: 'insensitive' } },
        { destinationCity: { contains: q, mode: 'insensitive' } },
        { billingCompany: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [count, items] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: true,
          assignedTo: true,
        },
      }),
    ]);

    return [count, items];
  },

  get: async (id) => {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  update: async (id, data) => {
    return prisma.ticket.update({
      where: { id },
      data,
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });
  },

  remove: async (id) => {
    return prisma.ticket.delete({
      where: { id },
    });
  },

  comment: async (ticketId, userId, body) => {
    return prisma.comment.create({
      data: {
        ticketId,
        authorId: userId,
        body,
      },
      include: {
        author: true,
      },
    });
  },

  comments: async (ticketId) => {
    return prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: { author: true },
    });
  },
};
