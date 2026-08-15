import { Router } from 'express';
import { HeroController } from '../controllers/hero.controller';
import { validate } from '../middlewares/validate.middleware';
import { updateHeroSchema } from '../schemas/hero.schema';

const router = Router();

// Public GET endpoint for landing page (fetches directly from PostgreSQL database)
router.get('/', HeroController.getHero);

// CMS Update endpoint (saves directly to PostgreSQL database)
router.put(
  '/',
  validate(updateHeroSchema),
  HeroController.updateHero
);

// CMS Reset endpoint (resets PostgreSQL database record)
router.post(
  '/reset',
  HeroController.resetHero
);

export default router;
