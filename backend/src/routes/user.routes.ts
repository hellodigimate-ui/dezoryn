import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { Role } from '../constants/roles';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  changePasswordSchema,
} from '../schemas/user.schema';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.post(
  '/',
  authorize(Role.ADMIN),
  validate(createUserSchema),
  UserController.createUser
);

router.get(
  '/',
  authorize(Role.ADMIN),
  UserController.getUsers
);

router.post(
  '/change-password',
  validate(changePasswordSchema),
  UserController.changePassword
);

router.get(
  '/:id',
  authorize(Role.ADMIN),
  validate(getUserByIdSchema),
  UserController.getUserById
);

router.patch(
  '/:id',
  authorize(Role.ADMIN),
  validate(updateUserSchema),
  UserController.updateUser
);

router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validate(getUserByIdSchema),
  UserController.deleteUser
);

export default router;
