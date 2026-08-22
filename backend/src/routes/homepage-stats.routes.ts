import { Router } from 'express';
import { HomepageStatsController } from '../controllers/homepage-stats.controller';

const router = Router();

// Public GET endpoint for homepage stats
router.get('/', HomepageStatsController.get);

// CMS Update endpoint
router.put('/', HomepageStatsController.update);

// CMS Reset endpoint
router.post('/reset', HomepageStatsController.reset);

export default router;
