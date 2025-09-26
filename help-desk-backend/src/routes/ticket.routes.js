import { Router } from 'express';
import { ticketController } from '../controllers/ticketController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// CRUD de Tickets
router.get('/', requireAuth, ticketController.list);
router.post('/', requireAuth, validate(ticketController.createValidate), ticketController.create);
router.get('/:id', requireAuth, ticketController.get);
router.put('/:id', requireAuth, validate(ticketController.updateValidate), ticketController.update);
router.delete('/:id', requireAuth, ticketController.remove);

// Comentários
router.get('/:id/comments', requireAuth, ticketController.listComments);
router.post('/:id/comments', requireAuth, ticketController.addComment);

export default router;
