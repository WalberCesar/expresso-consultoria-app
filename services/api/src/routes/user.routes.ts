import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.get('/profile', authMiddleware, (req, res, next) =>
  userController.getProfile(req, res, next)
);

export default router;
