import { Router } from 'express';
import { TestimonialController, uploadPhoto } from '../controllers/testimonial.controller';

const router = Router();

// Public
router.get('/', TestimonialController.getAll);
router.get('/:id', TestimonialController.getById);

// Admin CRUD
router.post('/', uploadPhoto, TestimonialController.create);
router.put('/reorder', TestimonialController.reorder);
router.put('/:id', uploadPhoto, TestimonialController.update);
router.patch('/:id/toggle-enabled', TestimonialController.toggleEnabled);
router.delete('/:id', TestimonialController.delete);

export default router;
