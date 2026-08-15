import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/stats', AnalyticsController.getStats);
router.post('/track', AnalyticsController.trackEvent);

export default router;
