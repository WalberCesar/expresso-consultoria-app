import { Request, Response, NextFunction } from 'express';
import { PullRequest, PushRequest } from '../types/sync.types';

export class SyncController {
  async handlePull(
    req: Request<{}, {}, PullRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Usuário não autenticado'
        });
        return;
      }

      res.status(501).json({
        message: 'Pull endpoint - implementação pendente'
      });
    } catch (error) {
      next(error);
    }
  }

  async handlePush(
    req: Request<{}, {}, PushRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Usuário não autenticado'
        });
        return;
      }

      res.status(501).json({
        message: 'Push endpoint - implementação pendente'
      });
    } catch (error) {
      next(error);
    }
  }
}
