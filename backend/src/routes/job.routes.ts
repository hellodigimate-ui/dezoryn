import { Router } from 'express';
import { JobController } from '../controllers/job.controller';

const router = Router();

// Public & Landing page fetch
router.get('/', JobController.getAll);
router.get('/:id', JobController.getById);

// Admin Job Management & Reordering
router.post('/', JobController.create);
router.put('/reorder', JobController.reorder);
router.put('/:id', JobController.update);
router.patch('/:id/toggle-status', JobController.toggleStatus);
router.post('/:id/duplicate', JobController.duplicate);
router.delete('/:id', JobController.delete);

export default router;
