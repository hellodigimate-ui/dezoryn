import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../constants/roles';

const router = Router();

// Public Support Ticket Submission
router.post('/', SupportController.create);

// Protected Admin Support Ticket Management Endpoints
router.get('/', authenticate, authorize(Role.ADMIN), SupportController.getAll);
router.get('/:id', authenticate, authorize(Role.ADMIN), SupportController.getById);
router.patch('/:id', authenticate, authorize(Role.ADMIN), SupportController.update);
router.delete('/:id', authenticate, authorize(Role.ADMIN), SupportController.delete);

export default router;
