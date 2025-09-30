import { z } from 'zod';
import { ticketService } from '../services/ticketService.js';

// =======================
// VALIDADORES (Zod)
// =======================
const createSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(3),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedToId: z.number().optional(),

    // Campos de transporte
    originCity: z.string().optional(),
    originUF: z.string().length(2).optional(),
    originIBGEId: z.number().optional(),
    destinationCity: z.string().optional(),
    destinationUF: z.string().length(2).optional(),
    destinationIBGEId: z.number().optional(),
    freightBasis: z.enum(['FULL', 'TON']).optional(),
    incoterm: z.enum(['CIF', 'FOB']).optional(),
    paymentTerm: z.string().optional(),
    paymentType: z.string().optional(),
    cargoWeight: z.number().optional(),
    billingCompany: z.string().optional(),
    plateCavalo: z.string().optional(),
    plateCarreta1: z.string().optional(),
    plateCarreta2: z.string().optional(),
    plateCarreta3: z.string().optional(),
    fleetType: z.enum(['FROTA', 'TERCEIRO']).optional(),
    thirdPartyPayment: z.number().optional(),
    serviceTaker: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedToId: z.number().nullable().optional(),

    // Campos de transporte
    originCity: z.string().optional(),
    originUF: z.string().length(2).optional(),
    originIBGEId: z.number().optional().nullable(),
    destinationCity: z.string().optional(),
    destinationUF: z.string().length(2).optional(),
    destinationIBGEId: z.number().optional().nullable(),
    freightBasis: z.enum(['FULL', 'TON']).optional(),
    incoterm: z.enum(['CIF', 'FOB']).optional(),
    paymentTerm: z.string().optional(),
    paymentType: z.string().optional(),
    cargoWeight: z.number().optional().nullable(),
    billingCompany: z.string().optional(),
    plateCavalo: z.string().optional(),
    plateCarreta1: z.string().optional(),
    plateCarreta2: z.string().optional(),
    plateCarreta3: z.string().optional(),
    fleetType: z.enum(['FROTA', 'TERCEIRO']).optional(),
    thirdPartyPayment: z.number().optional().nullable(),
    serviceTaker: z.string().optional(),
  }),
});

// =======================
// CONTROLLER
// =======================
export const ticketController = {
  createValidate: createSchema,
  updateValidate: updateSchema,

  create: async (req, res, next) => {
    try {
      const data = {
        ...req.body,
        createdById: parseInt(req.user.sub),
        assignedToId: req.body.assignedToId ? parseInt(req.body.assignedToId) : undefined,
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      const ticket = await ticketService.get(id);
      if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });
      res.json(ticket);
    } catch (e) {
      next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      const updateData = { ...req.body };
      if (req.body.assignedToId) {
        updateData.assignedToId = parseInt(req.body.assignedToId);
      }
      const updated = await ticketService.update(id, updateData);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      await ticketService.remove(id);
      res.json({ message: 'Removido' });
    } catch (e) {
      next(e);
    }
  },

  addComment: async (req, res, next) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = parseInt(req.user.sub);
      if (isNaN(ticketId) || isNaN(userId)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      const comment = await ticketService.comment(ticketId, userId, req.body.body);
      res.json(comment);
    } catch (e) {
      next(e);
    }
  },

  getComments: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      const comments = await ticketService.comments(id);
      res.json(comments);
    } catch (e) {
      next(e);
    }
  },
};
