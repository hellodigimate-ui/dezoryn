import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';

const router = Router();

router.get('/', PricingController.getAll);
router.get('/:id', PricingController.getById);
router.post('/', PricingController.create);
router.put('/reorder', PricingController.reorder);
router.put('/:id', PricingController.update);
router.patch('/:id/toggle-enabled', PricingController.toggleEnabled);
router.delete('/:id', PricingController.delete);

export default router;
