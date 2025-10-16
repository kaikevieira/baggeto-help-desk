import { Router } from 'express';
import { cookieTestController } from '../controllers/cookieTestController.js';

const router = Router();

router.post('/test', cookieTestController.test);
router.get('/verify', cookieTestController.verify);

export default router;