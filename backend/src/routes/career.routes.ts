import { Router } from 'express';
import { CareersCMSController } from '../controllers/careers-cms.controller';

const router = Router();

// Public & Admin Careers CMS Endpoints
router.get('/cms', CareersCMSController.get);
router.get('/', CareersCMSController.get);
router.put('/cms', CareersCMSController.update);
router.put('/', CareersCMSController.update);
router.post('/cms/reset', CareersCMSController.reset);
router.post('/reset', CareersCMSController.reset);

export default router;
