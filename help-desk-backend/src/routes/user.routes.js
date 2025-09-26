import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('ADMIN'), userController.list);

export default router;
