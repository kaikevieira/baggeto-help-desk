import { z } from 'zod';
import { templateService } from '../services/templateService.js';

const upsertSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    data: z.any(),
  })
});

const idSchema = z.object({ params: z.object({ id: z.coerce.number() }) });

export const templateController = {
  upsertValidate: upsertSchema,
  idValidate: idSchema,

  listMine: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const items = await templateService.listByUser(userId);
      res.json(items);
    } catch (e) { next(e); }
  },
  create: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const tpl = await templateService.create(userId, req.body);
      res.status(201).json(tpl);
    } catch (e) { next(e); }
  },
  update: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const id = Number(req.params.id);
      const tpl = await templateService.update(userId, id, req.body);
      res.json(tpl);
    } catch (e) { next(e); }
  },
  remove: async (req, res, next) => {
    try {
      const userId = Number(req.user.sub);
      const id = Number(req.params.id);
      await templateService.remove(userId, id);
      res.json({ ok: true });
    } catch (e) { next(e); }
  },
};
