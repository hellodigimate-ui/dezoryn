import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../constants/roles';

const router = Router();

// AI assistant endpoints
router.get('/settings', AIController.getSettings);
router.patch('/settings', AIController.updateSettings);
router.post('/generate', AIController.generateContent);

export default router;
