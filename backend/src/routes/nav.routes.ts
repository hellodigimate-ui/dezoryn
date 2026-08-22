import { Router } from 'express';
import { NavController } from '../controllers/nav.controller';

const router = Router();

// Public — landing page navbar fetch
router.get('/', NavController.getAll);

// CMS management
router.post('/', NavController.create);
router.post('/reset', NavController.reset);
router.put('/reorder', NavController.reorder);
router.put('/:id', NavController.update);
router.patch('/:id/toggle-visibility', NavController.toggleVisibility);
router.delete('/:id', NavController.remove);

export default router;
