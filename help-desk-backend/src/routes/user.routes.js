import { Router } from 'express';
import { userController, userSchemas } from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get('/',     requireAuth, requireRole('ADMIN'), validate(userSchemas.list),   userController.list);
router.post('/',    requireAuth, requireRole('ADMIN'), validate(userSchemas.create), userController.create);
router.put('/:id',  requireAuth, requireRole('ADMIN'), validate(userSchemas.update), userController.update);

export default router;
