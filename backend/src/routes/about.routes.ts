import { Router } from 'express';
import { AboutController } from '../controllers/about.controller';

const router = Router();

// Public route for retrieving About section data
router.get('/', AboutController.getAboutSection);

// Admin-accessible endpoints for updating content and media
router.put('/', AboutController.updateAboutSection);
router.post('/media', AboutController.updateMedia);
router.delete('/media', AboutController.removeMedia);

export default router;
