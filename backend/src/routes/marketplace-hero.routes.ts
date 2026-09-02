import { Router } from 'express';
import { MarketplaceHeroController } from '../controllers/marketplace-hero.controller';

const router = Router();

// GET /api/v1/marketplace-hero (Public & Admin)
router.get('/', MarketplaceHeroController.get);

// PUT /api/v1/marketplace-hero (Admin Update)
router.put('/', MarketplaceHeroController.update);

// POST /api/v1/marketplace-hero/reset (Admin Reset)
router.post('/reset', MarketplaceHeroController.reset);

export default router;
