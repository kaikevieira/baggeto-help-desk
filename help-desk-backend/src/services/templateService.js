import { prisma } from '../db.js';

export const templateService = {
  listByUser: (userId) => {
    return prisma.ticketTemplate.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  },
  create: (userId, { name, data }) => {
    return prisma.ticketTemplate.create({ data: { userId, name, data } });
  },
  update: async (userId, id, { name, data }) => {
    const tpl = await prisma.ticketTemplate.findUnique({ where: { id } });
    if (!tpl || tpl.userId !== userId) throw Object.assign(new Error('Não encontrado'), { status: 404 });
    return prisma.ticketTemplate.update({ where: { id }, data: { name, data } });
  },
  remove: async (userId, id) => {
    const tpl = await prisma.ticketTemplate.findUnique({ where: { id } });
    if (!tpl || tpl.userId !== userId) throw Object.assign(new Error('Não encontrado'), { status: 404 });
    return prisma.ticketTemplate.delete({ where: { id } });
  }
};
