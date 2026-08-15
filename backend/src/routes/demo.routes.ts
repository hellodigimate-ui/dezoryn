import { Router } from 'express';
import { DemoController } from '../controllers/demo.controller';

const router = Router();

router.get('/booking', DemoController.getBookings);
router.post('/booking', DemoController.createBooking);

router.get('/', DemoController.getAll);
router.get('/:id', DemoController.getById);
router.post('/', DemoController.create);
router.put('/:id', DemoController.update);
router.delete('/:id', DemoController.delete);

export default router;
