import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', validate(authController.validateAuth), authController.register);
router.post('/login',    validate(authController.validateAuth), authController.login);
router.post('/refresh',  authController.refresh);
router.post('/logout',   authController.logout);
router.get('/me',        requireAuth, authController.me);

export default router;
