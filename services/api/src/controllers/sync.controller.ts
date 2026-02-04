import { Request, Response, NextFunction } from 'express';
import { PullRequest, PushRequest } from '../types/sync.types';
import { SyncService } from '../services/sync.service';
import { PullRequestSchema, PushRequestSchema } from '../validators/sync.validators';
import { ZodError } from 'zod';

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

      const validationResult = PullRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Dados de requisição inválidos',
          details: validationResult.error.issues
        });
        return;
      }

      const { lastPulledAt } = validationResult.data;

      if (lastPulledAt !== null && (lastPulledAt < 0 || !Number.isFinite(lastPulledAt))) {
        res.status(400).json({
          error: 'lastPulledAt deve ser um timestamp válido'
        });
        return;
      }

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

      const validationResult = PushRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Dados de requisição inválidos',
          details: validationResult.error.issues
        });
        return;
      }

      const { changes } = validationResult.data;

      if (!changes || Object.keys(changes).length === 0) {
        res.status(400).json({
          error: 'Changes não pode estar vazio'
        });
        return;
      }

      const result = await this.syncService.pushChanges(
        changes,
        req.user.empresa_id
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Erro de validação',
          details: error.issues
        });
        return;
      }
      next(error);
    }
  }
}
