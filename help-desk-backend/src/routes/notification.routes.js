import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { notificationController } from '../controllers/notificationController.js';

const router = Router();

router.get('/', requireAuth, validate(notificationController.listValidate), notificationController.list);
router.get('/unread-count', requireAuth, notificationController.unreadCount);
router.post('/:id/read', requireAuth, validate(notificationController.idValidate), notificationController.markRead);
router.post('/:id/dismiss', requireAuth, validate(notificationController.idValidate), notificationController.dismiss);
router.get('/stream', requireAuth, notificationController.stream);
// Debug/test endpoint
router.post('/test-email', requireAuth, notificationController.testEmail);
router.post('/test-email/:userId', requireAuth, notificationController.testEmailToUser);

export default router;
