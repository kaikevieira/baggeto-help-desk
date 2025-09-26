import { z } from 'zod';
import { ticketService } from '../services/ticketService.js';

const createSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(3),
    priority: z.enum(['LOW','MEDIUM','HIGH','URGENT']).optional(),
    assignedToId: z.string().optional()
  })
});

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    status: z.enum(['OPEN','IN_PROGRESS','RESOLVED','CLOSED']).optional(),
    priority: z.enum(['LOW','MEDIUM','HIGH','URGENT']).optional(),
    assignedToId: z.string().nullable().optional()
  })
});

export const ticketController = {
  createValidate: createSchema,
  updateValidate: updateSchema,

  create: async (req, res, next) => {
    try {
      const data = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority ?? 'MEDIUM',
        createdById: req.user.sub,
        assignedToId: req.body.assignedToId || null
      };
      const ticket = await ticketService.create(data);
      res.status(201).json(ticket);
    } catch (e) {
      next(e);
    }
  },

  list: async (req, res, next) => {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);
      const status = req.query.status;
      const q = req.query.q;

      const [count, items] = await ticketService.list({ page, pageSize, status, q });
      res.json({
        page, pageSize, count,
        pages: Math.ceil(count / pageSize),
        items
      });
    } catch (e) {
      next(e);
    }
  },

  get: async (req, res, next) => {
    try {
      const ticket = await ticketService.get(req.params.id);
      if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });
      res.json(ticket);
    } catch (e) {
      next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const updated = await ticketService.update(req.params.id, req.body);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      await ticketService.remove(req.params.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },

  addComment: async (req, res, next) => {
    try {
      const comment = await ticketService.comment(req.params.id, req.user.sub, req.body.body);
      res.status(201).json(comment);
    } catch (e) {
      next(e);
    }
  },

  listComments: async (req, res, next) => {
    try {
      const comments = await ticketService.comments(req.params.id);
      res.json(comments);
    } catch (e) {
      next(e);
    }
  }
};
