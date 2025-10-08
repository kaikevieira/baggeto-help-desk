import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { templateController } from '../controllers/templateController.js';

const router = Router();

router.get('/', requireAuth, templateController.listMine);
router.post('/', requireAuth, validate(templateController.upsertValidate), templateController.create);
router.put('/:id', requireAuth, validate(templateController.idValidate), validate(templateController.upsertValidate), templateController.update);
router.delete('/:id', requireAuth, validate(templateController.idValidate), templateController.remove);

export default router;
