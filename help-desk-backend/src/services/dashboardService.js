import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const dashboardService = {
  async summary(userId, userRole) {
    let baseWhere = {};
    
    // Aplicar filtros baseados no role do usuário
    if (userRole !== 'ADMIN') {
      baseWhere = {
        OR: [
          { createdById: userId },
          { assignedToId: userId }
        ]
      };
    }

    // Função para combinar where com status
    const combineWhere = (status) => {
      if (userRole !== 'ADMIN') {
        return {
          AND: [
            baseWhere,
            { status: status }
          ]
        };
      } else {
        return { status: status };
      }
    };

    const [total, open, inProg, resolved, closed, last7] = await Promise.all([
      prisma.ticket.count({ where: baseWhere }),
      prisma.ticket.count({ where: combineWhere('OPEN') }),
      prisma.ticket.count({ where: combineWhere('IN_PROGRESS') }),
      prisma.ticket.count({ where: combineWhere('RESOLVED') }),
      prisma.ticket.count({ where: combineWhere('CLOSED') }),
      prisma.ticket.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: baseWhere
      })
    ]);

    return {
      total,
      byStatus: { OPEN: open, IN_PROGRESS: inProg, RESOLVED: resolved, CLOSED: closed },
      distribution: last7.map((i) => ({ status: i.status, count: i._count._all }))
    };
  }
};
