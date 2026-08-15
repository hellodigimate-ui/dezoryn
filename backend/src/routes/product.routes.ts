import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

// Public — landing page fetch
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Admin management
router.post('/', ProductController.create);
router.put('/reorder', ProductController.reorder);
router.put('/:id', ProductController.update);
router.patch('/:id/toggle-enabled', ProductController.toggleEnabled);
router.post('/:id/duplicate', ProductController.duplicate);
router.delete('/:id', ProductController.delete);

export default router;
