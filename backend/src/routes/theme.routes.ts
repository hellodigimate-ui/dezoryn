import { Router } from 'express';
import { ThemeController } from '../controllers/theme.controller';

const router = Router();

router.get('/', ThemeController.get);
router.put('/', ThemeController.update);

export default router;
