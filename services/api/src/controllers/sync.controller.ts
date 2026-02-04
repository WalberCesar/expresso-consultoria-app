import { Request, Response, NextFunction } from 'express';
import { PullRequest, PushRequest } from '../types/sync.types';
import { SyncService } from '../services/sync.service';

export class SyncController {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

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

      const { lastPulledAt } = req.body;

      const result = await this.syncService.pullChanges(
        lastPulledAt,
        req.user.empresa_id
      );

      res.status(200).json(result);
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

      const { changes } = req.body;

      const result = await this.syncService.pushChanges(
        changes,
        req.user.empresa_id
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
