import { Router } from 'express';
import { FooterController } from '../controllers/footer.controller';

const router = Router();

router.get('/', FooterController.get);
router.put('/', FooterController.update);

export default router;
