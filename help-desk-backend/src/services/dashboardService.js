import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const dashboardService = {
  async summary() {
    const [total, open, inProg, resolved, closed, last7] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { status: 'CLOSED' } }),
      prisma.ticket.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    return {
      total,
      byStatus: { OPEN: open, IN_PROGRESS: inProg, RESOLVED: resolved, CLOSED: closed },
      distribution: last7.map((i) => ({ status: i.status, count: i._count._all }))
    };
  }
};
