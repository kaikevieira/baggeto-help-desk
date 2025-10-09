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
          { assignedToId: userId },
          // incluir também quando usuário está nas atribuições adicionais (N:N)
          { assignees: { some: { userId: userId } } }
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

    const [total, open, inProg, resolved, closed] = await Promise.all([
      prisma.ticket.count({ where: baseWhere }),
      prisma.ticket.count({ where: combineWhere('OPEN') }),
      prisma.ticket.count({ where: combineWhere('IN_PROGRESS') }),
      prisma.ticket.count({ where: combineWhere('RESOLVED') }),
      prisma.ticket.count({ where: combineWhere('CLOSED') })
    ]);

    return {
      total,
      byStatus: { OPEN: open, IN_PROGRESS: inProg, RESOLVED: resolved, CLOSED: closed }
    };
  }
};
