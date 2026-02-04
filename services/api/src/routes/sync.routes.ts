import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const syncController = new SyncController();

router.get('/pull', authMiddleware, (req, res, next) =>
  syncController.handlePull(req, res, next)
);

router.post('/push', authMiddleware, (req, res, next) =>
  syncController.handlePush(req, res, next)
);

export default router;
