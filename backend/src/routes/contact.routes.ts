import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../constants/roles';

const router = Router();

// Contact Settings and Submissions Routes
router.get('/', ContactController.get);
router.post('/submit', ContactController.submitInquiry);
router.get('/submissions', ContactController.getSubmissions);
router.patch('/submissions/:id/status', ContactController.updateStatus);
router.delete('/submissions/:id', ContactController.deleteSubmission);

// Protected Admin Settings route
router.put('/', authenticate, authorize(Role.ADMIN), ContactController.update);

export default router;
