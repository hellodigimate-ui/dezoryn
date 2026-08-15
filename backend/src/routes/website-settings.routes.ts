import { Router } from 'express';
import { WebsiteSettingsController } from '../controllers/website-settings.controller';

const router = Router();

router.get('/', WebsiteSettingsController.get);
router.put('/', WebsiteSettingsController.update);

export default router;
