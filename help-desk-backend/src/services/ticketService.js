import { prisma } from '../db.js';

export const ticketService = {
  create: async (data) => {
    // Cria com um número temporário único para evitar colisões
    const tmpNumber = `TMP-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const {
      assignedUserIds,
      ...rest
    } = data;

    const created = await prisma.ticket.create({
      data: {
        status: rest.status || 'OPEN',
        ...rest,
        ticketNumber: tmpNumber,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    // Define ticketNumber final baseado no ID (sempre único)
    const finalNumber = String(100000 + created.id);
    await prisma.ticket.update({
      where: { id: created.id },
      data: { ticketNumber: finalNumber },
    });

    if (Array.isArray(assignedUserIds) && assignedUserIds.length > 0) {
      const distinct = Array.from(new Set(assignedUserIds.filter((id) => id && id !== created.assignedToId)));
      if (distinct.length) {
        await prisma.ticketAssignment.createMany({
          data: distinct.map((userId) => ({ ticketId: created.id, userId })),
          skipDuplicates: true,
        });
      }
    }

    // Recarrega incluindo assignees
    const withAssignees = await prisma.ticket.findUnique({
      where: { id: created.id },
      include: { createdBy: true, assignedTo: true, assignees: { include: { user: true } } },
    });
    return withAssignees;
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
          { assignedToId: userId },
          { assignees: { some: { userId } } }
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
          assignees: { include: { user: true } },
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
        assignees: { include: { user: true } },
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
      // Pode visualizar se for criador, atribuído principal ou incluído nas atribuições adicionais
      const isAssigned = ticket.assignedToId === userId || (ticket.assignees || []).some(a => a.userId === userId);
      if (ticket.createdById !== userId && !isAssigned) {
        return null; // não pode ver
      }
      // Editar é controlado no update(); aqui apenas retornamos os dados
    }

    return ticket;
  },

  update: async (id, data, userId, userRole, originalAssignedUserIds) => {
    const current = await prisma.ticket.findUnique({
      where: { id },
      include: { assignees: true },
    });
    if (!current) throw new Error('Ticket não encontrado');

    const isCreator = current.createdById === userId;
    const isAdmin = userRole === 'ADMIN';
  const isAssigned = current.assignees.some((a) => a.userId === userId) || current.assignedToId === userId;

    // Regras: Admin/Criador: total; Atribuído: apenas operacional
    if (!(isAdmin || isCreator)) {
      if (!isAssigned) throw new Error('Permissão negada: você não pode editar este ticket');
      // Atribuídos podem alterar somente controles operacionais: status e prioridade
      const allowed = ['status', 'priority'];
      const filtered = {};
      for (const k of allowed) if (k in data) filtered[k] = data[k];
      data = filtered;
    }

    // Gerenciar múltiplos atribuídos (apenas admin/criador)
    let assignedUserIds = undefined;
    if ((isAdmin || isCreator) && Array.isArray(data.assignedUserIds)) {
      assignedUserIds = Array.from(new Set(data.assignedUserIds.filter(Boolean)));
      delete data.assignedUserIds;
    } else {
      delete data.assignedUserIds;
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data,
      include: {
        createdBy: true,
        assignedTo: true,
        assignees: { include: { user: true } },
      },
    });

    if (assignedUserIds && (isAdmin || isCreator)) {
      // Replace assignments set with provided list excluding primary assignedToId
      const target = assignedUserIds.filter((uid) => uid !== updated.assignedToId);
      // Remove não listados
      await prisma.ticketAssignment.deleteMany({ where: { ticketId: id, userId: { notIn: target } } });
      // Add os faltantes
      if (target.length) {
        await prisma.ticketAssignment.createMany({ data: target.map((uid) => ({ ticketId: id, userId: uid })), skipDuplicates: true });
      } else {
        // se vazio, limpa todos
        await prisma.ticketAssignment.deleteMany({ where: { ticketId: id } });
      }
    }

    // Atribuídos podem adicionar pessoas (apenas add, sem remover), e não podem alterar o principal
    if (!isAdmin && !isCreator && isAssigned && Array.isArray(originalAssignedUserIds)) {
      const desired = Array.from(new Set(originalAssignedUserIds.filter(Boolean)));
      const currentSet = new Set(updated.assignees.map(a => a.userId));
      const toAdd = desired.filter(uid => uid !== updated.assignedToId && !currentSet.has(uid));
      if (toAdd.length) {
        await prisma.ticketAssignment.createMany({ data: toAdd.map(uid => ({ ticketId: id, userId: uid })), skipDuplicates: true });
      }
      // Não removemos ninguém se estiver faltando; e ignoramos tentativas de mudar assignedToId porque não veio neste fluxo
    }

    return updated;
  },

  remove: async (id, userId, _userRole) => {
    // Apenas criador pode remover
    const ticket = await prisma.ticket.findUnique({ where: { id }, select: { createdById: true } });
    if (!ticket || ticket.createdById !== userId) {
      throw new Error('Permissão negada: você não pode remover este ticket');
    }
    await prisma.ticketAssignment.deleteMany({ where: { ticketId: id } });
    return prisma.ticket.delete({ where: { id } });
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
