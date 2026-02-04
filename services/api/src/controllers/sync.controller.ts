import { Request, Response, NextFunction } from 'express';
import { PullRequest, PushRequest } from '../types/sync.types';
import { SyncService } from '../services/sync.service';
import { PushRequestSchema } from '../validators/sync.validators';

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
      console.log('📥 [SYNC PULL] Requisição recebida');
      console.log('👤 Usuário:', req.user?.email);
      console.log('🔑 Query params:', req.query);

      if (!req.user) {
        res.status(401).json({
          error: 'Usuário não autenticado'
        });
        return;
      }

      // WatermelonDB envia parâmetros via query string
      const lastPulledAtParam = req.query.lastPulledAt as string | undefined;

      const lastPulledAt = lastPulledAtParam ? parseInt(lastPulledAtParam, 10) : null;

      if (lastPulledAt !== null && (isNaN(lastPulledAt) || lastPulledAt < 0)) {
        res.status(400).json({
          error: 'lastPulledAt deve ser um timestamp válido'
        });
        return;
      }

      console.log('⏰ Last pulled at:', lastPulledAt);
      console.log('🏢 Empresa ID:', req.user.empresa_id);

      const result = await this.syncService.pullChanges(
        lastPulledAt,
        req.user.empresa_id
      );

      console.log('✅ [SYNC PULL] Resposta enviada:', {
        registros: (result.changes.registros?.created.length || 0) + (result.changes.registros?.updated.length || 0),
        fotos: (result.changes.foto_registros?.created.length || 0) + (result.changes.foto_registros?.updated.length || 0),
        timestamp: result.timestamp
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('❌ [SYNC PULL] Erro:', error);
      next(error);
    }
  }

  async handlePush(
    req: Request<{}, {}, PushRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log('📤 [SYNC PUSH] Requisição recebida');
      console.log('👤 Usuário:', req.user?.email);
      console.log('📦 Body keys:', Object.keys(req.body));

      if (!req.user) {
        res.status(401).json({
          error: 'Usuário não autenticado'
        });
        return;
      }

      const validationResult = PushRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error('❌ [SYNC PUSH] Validação falhou:', validationResult.error.issues);
        res.status(400).json({
          error: 'Dados de requisição inválidos',
          details: validationResult.error.issues
        });
        return;
      }

      const { changes } = validationResult.data;

      console.log('📊 [SYNC PUSH] Changes recebidas:');
      Object.keys(changes).forEach(table => {
        const tableChanges = changes[table];
        if (tableChanges) {
          console.log(`  📋 ${table}:`, {
            created: tableChanges.created.length,
            updated: tableChanges.updated.length,
            deleted: tableChanges.deleted.length
          });
        }
      });

      await this.syncService.pushChanges(
        changes,
        req.user.empresa_id
      );

      console.log('✅ [SYNC PUSH] Dados salvos com sucesso');

      res.status(200).json({});
    } catch (error) {
      console.error('❌ [SYNC PUSH] Erro:', error);
      next(error);
    }
  }
}
