import { z } from 'zod';
import { notificationService } from '../services/notificationService.js';
import { sendMail, ticketEmailTemplate } from '../utils/mailer.js';

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
  emailBodyValidate: z.object({ body: z.object({ to: z.string().email() }) }),

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

  // Envia um e-mail de teste para o usuário autenticado (se tiver e-mail cadastrado)
  testEmail: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const ok = await notificationService.sendTestEmail(userId);
      if (!ok) return res.status(400).json({ message: 'Sem e-mail cadastrado ou SMTP não configurado' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  }
  ,
  // Admin: envia e-mail de teste para um usuário específico
  testEmailToUser: async (req, res, next) => {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Apenas ADMIN pode testar e-mail de outro usuário' });
      }
      const userId = Number(req.params.userId);
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ message: 'userId inválido' });
      }
      const ok = await notificationService.sendTestEmail(userId);
      if (!ok) return res.status(400).json({ message: 'Sem e-mail cadastrado ou SMTP não configurado' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  },

  // Admin: envia e-mail de teste para um endereço arbitrário (diagnóstico)
  testEmailToAddress: async (req, res, next) => {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Apenas ADMIN pode testar e-mail para endereços arbitrários' });
      }
      const { to } = req.body || {};
      if (!to) return res.status(400).json({ message: 'Campo "to" é obrigatório' });
      const subject = 'Teste de e-mail • Diagnóstico SMTP';
      const html = ticketEmailTemplate({ title: 'Teste de e-mail (diagnóstico)', message: 'Se você recebeu este e-mail, o envio para domínios externos está funcionando.', ticketId: 0 });
      const info = await sendMail({ to, subject, html });
      res.json({ ok: true, info: { accepted: info?.accepted, rejected: info?.rejected } });
    } catch (e) { next(e); }
  }
};
