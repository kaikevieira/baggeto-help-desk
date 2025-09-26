import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/summary', requireAuth, dashboardController.summary);

export default router;
