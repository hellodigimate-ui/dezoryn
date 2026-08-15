import { Router } from 'express';
import { FaqController } from '../controllers/faq.controller';

const router = Router();

// Public & Landing page fetch
router.get('/', FaqController.getAll);
router.get('/:id', FaqController.getById);

// Admin FAQ Management & Accordion Reordering
router.post('/', FaqController.create);
router.put('/reorder', FaqController.reorder);
router.put('/:id', FaqController.update);
router.patch('/:id/toggle-status', FaqController.toggleStatus);
router.post('/:id/duplicate', FaqController.duplicate);
router.delete('/:id', FaqController.delete);

export default router;
