import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../constants/roles';

const router = Router();

// Public Routes
router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);

// Protected Admin Routes
router.post('/', authenticate, authorize(Role.ADMIN), ServiceController.create);
router.post('/reorder', authenticate, authorize(Role.ADMIN), ServiceController.reorder);
router.post('/:id/duplicate', authenticate, authorize(Role.ADMIN), ServiceController.duplicate);
router.put('/:id', authenticate, authorize(Role.ADMIN), ServiceController.update);
router.patch('/:id/toggle', authenticate, authorize(Role.ADMIN), ServiceController.toggleStatus);
router.delete('/:id', authenticate, authorize(Role.ADMIN), ServiceController.delete);

export default router;
