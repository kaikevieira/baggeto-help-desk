import { prisma } from '../db.js';

export const ticketService = {
  create: async (data) => {
    // Gera um número único para o ticket começando do 100000
    const count = await prisma.ticket.count();
    const ticketNumber = String(100000 + count + 1);
    
    return prisma.ticket.create({
      data: {
        status: data.status || 'OPEN',
        ...data,
        ticketNumber,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });
  },

  list: async ({ page = 1, pageSize = 10, status, q, userId, userRole }) => {
    let where = {};
    
    // Construir filtros de forma mais clara
    const filters = [];
    
    // 1. Filtro de permissões (sempre primeiro para usuários não-admin)
    if (userRole !== 'ADMIN') {
      filters.push({
        OR: [
          { createdById: userId },
          { assignedToId: userId }
        ]
      });
    }
    
    // 2. Filtro de status
    if (status) {
      filters.push({ status: status });
    }
    
    // 3. Filtro de busca
    if (q) {
      filters.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { originCity: { contains: q, mode: 'insensitive' } },
          { destinationCity: { contains: q, mode: 'insensitive' } },
          { billingCompany: { contains: q, mode: 'insensitive' } },
          { ticketNumber: { contains: q, mode: 'insensitive' } }
        ]
      });
    }
    
    // Combinar todos os filtros
    if (filters.length > 0) {
      where.AND = filters;
    }

    const [count, items] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: true,
          assignedTo: true,
        },
      }),
    ]);

    return [count, items];
  },

  get: async (id, userId, userRole) => {
    // Primeiro buscar o ticket pelo ID
    const ticket = await prisma.ticket.findUnique({
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

    // Se não encontrou o ticket, retorna null
    if (!ticket) {
      return null;
    }

    // Verificar permissões para usuários não-admin
    if (userRole !== 'ADMIN') {
      // Pode visualizar se for criador ou atribuído
      if (ticket.createdById !== userId && ticket.assignedToId !== userId) {
        return null; // não pode ver
      }
      // Editar é controlado no update(); aqui apenas retornamos os dados
    }

    return ticket;
  },

  update: async (id, data, userId, userRole) => {
    // Permissões: ADMIN pode editar qualquer; USER pode editar apenas os tickets que ele criou
    if (userRole !== 'ADMIN') {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        select: { createdById: true }
      });
      if (!ticket || ticket.createdById !== userId) {
        throw new Error('Permissão negada: você não pode editar este ticket');
      }
    }

    return prisma.ticket.update({
      where: { id },
      data,
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });
  },

  remove: async (id, userId, userRole) => {
    // Permissões: ADMIN pode remover; USER apenas se for criador
    if (userRole !== 'ADMIN') {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        select: { createdById: true }
      });
      if (!ticket || ticket.createdById !== userId) {
        throw new Error('Permissão negada: você não pode remover este ticket');
      }
    }

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
