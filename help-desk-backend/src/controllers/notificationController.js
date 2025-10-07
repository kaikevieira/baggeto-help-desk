import { z } from 'zod';
import { notificationService } from '../services/notificationService.js';

const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().optional(),
    unread: z.coerce.boolean().optional(),
  })
});

const idParamSchema = z.object({ params: z.object({ id: z.coerce.number() }) });

export const notificationController = {
  listValidate: listSchema,
  idValidate: idParamSchema,

  list: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const { page = 1, pageSize = 20, unread } = req.query;
      const pageNum = Number(page || 1);
      const pageSizeNum = Number(pageSize || 20);
      const unreadBool = unread === true || unread === 'true';
      const [count, items] = await notificationService.listForUser(userId, { page: pageNum, pageSize: pageSizeNum, unread: unreadBool });
      res.json({ page: pageNum, pageSize: pageSizeNum, count, pages: Math.ceil(count / pageSizeNum), items });
    } catch (e) { next(e); }
  },

  unreadCount: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const count = await notificationService.unreadCount(userId);
      res.json({ count });
    } catch (e) { next(e); }
  },

  markRead: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const notificationId = Number(req.params.id);
      const r = await notificationService.markRead(userId, notificationId);
      if (!r) return res.status(404).json({ message: 'Não encontrado' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  },

  dismiss: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const notificationId = Number(req.params.id);
      const r = await notificationService.dismiss(userId, notificationId);
      if (!r) return res.status(404).json({ message: 'Não encontrado' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  },

  stream: (req, res) => notificationService.sseHandler(req, res),
};
