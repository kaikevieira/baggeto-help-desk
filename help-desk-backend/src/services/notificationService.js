import { prisma } from '../db.js';

// In-memory SSE subscribers: Map<userId, Set<Response>>
const subscribers = new Map();

function pushToUser(userId, event) {
  const set = subscribers.get(userId);
  if (!set) return;
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of set) {
    try { res.write(payload); } catch {}
  }
}

export const notificationService = {
  async create({ type, ticketId, message, actorId }) {
    // Descobrir destinatários: criador, atribuído e todos admins (exclui ator)
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { createdById: true, assignedToId: true, assignees: { select: { userId: true } } }
    });
    if (!ticket) return null;

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const recipientIds = new Set();
  if (ticket.createdById) recipientIds.add(ticket.createdById);
  if (ticket.assignedToId) recipientIds.add(ticket.assignedToId);
  for (const a of (ticket.assignees || [])) recipientIds.add(a.userId);
    for (const a of admins) recipientIds.add(a.id);
    if (actorId) recipientIds.delete(actorId);

    const notification = await prisma.notification.create({
      data: {
        type, message, ticketId, actorId: actorId ?? null,
        recipients: {
          create: Array.from(recipientIds).map((userId) => ({ userId }))
        }
      },
      include: { recipients: true }
    });

    // Push via SSE para destinatários
    for (const r of notification.recipients) {
      pushToUser(r.userId, { kind: 'notification:new', notificationId: notification.id });
    }
    return notification;
  },

  // Eventos helpers
  async notifyTicketCreated(ticketId, actorId) {
    const message = `Novo chamado criado (#${ticketId}).`;
    return this.create({ type: 'TICKET_CREATED', ticketId, message, actorId });
  },
  async notifyTicketUpdated(ticketId, actorId) {
    const message = `Atualização no chamado #${ticketId}.`;
    return this.create({ type: 'TICKET_UPDATED', ticketId, message, actorId });
  },
  async notifyCommentAdded(ticketId, actorId) {
    const message = `Novo comentário no chamado #${ticketId}.`;
    return this.create({ type: 'COMMENT_ADDED', ticketId, message, actorId });
  },

  // Listagem por usuário
  async listForUser(userId, { page = 1, pageSize = 20, unread } = {}) {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    const where = {
      userId,
      dismissedAt: null,
      ...(unread ? { readAt: null } : {})
    };

    const [count, items] = await Promise.all([
      prisma.notificationRecipient.count({ where }),
      prisma.notificationRecipient.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
        include: {
          notification: {
            include: { ticket: true, actor: { select: { id: true, username: true } } }
          }
        }
      })
    ]);
    return [count, items];
  },

  async unreadCount(userId) {
    return prisma.notificationRecipient.count({ where: { userId, readAt: null, dismissedAt: null } });
  },

  async markRead(userId, notificationId) {
    const rec = await prisma.notificationRecipient.findFirst({
      where: { userId, notificationId }
    });
    if (!rec) return null;
    if (rec.readAt) return rec;
    return prisma.notificationRecipient.update({ where: { id: rec.id }, data: { readAt: new Date() } });
  },

  async dismiss(userId, notificationId) {
    const rec = await prisma.notificationRecipient.findFirst({
      where: { userId, notificationId }
    });
    if (!rec) return null;
    return prisma.notificationRecipient.update({ where: { id: rec.id }, data: { dismissedAt: new Date() } });
  },

  // SSE stream
  sseHandler(req, res) {
    const userId = Number(req.user.sub);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Hello event
    res.write(`data: ${JSON.stringify({ kind: 'sse:connected' })}\n\n`);

    let set = subscribers.get(userId);
    if (!set) subscribers.set(userId, (set = new Set()));
    set.add(res);

    req.on('close', () => {
      const s = subscribers.get(userId);
      if (s) {
        s.delete(res);
        if (s.size === 0) subscribers.delete(userId);
      }
    });
  }
};
