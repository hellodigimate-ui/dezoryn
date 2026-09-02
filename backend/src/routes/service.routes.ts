import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';

const router = Router();

// Public & Admin Service Endpoints
router.get('/', ServiceController.getAll);
router.delete('/bulk/clear-all', ServiceController.clearAll);
router.get('/:id', ServiceController.getById);
router.post('/', ServiceController.create);
router.post('/reorder', ServiceController.reorder);
router.post('/:id/duplicate', ServiceController.duplicate);
router.put('/:id', ServiceController.update);
router.patch('/:id/toggle', ServiceController.toggleStatus);
router.delete('/:id', ServiceController.delete);

export default router;
