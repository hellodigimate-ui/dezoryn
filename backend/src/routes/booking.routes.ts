import { Router } from 'express';
import { DemoController } from '../controllers/demo.controller';

const router = Router();

router.get('/', DemoController.getBookings);
router.post('/', DemoController.createBooking);

router.get('/booking', DemoController.getBookings);
router.post('/booking', DemoController.createBooking);

router.get('/bookings', DemoController.getBookings);
router.post('/bookings', DemoController.createBooking);

export default router;
