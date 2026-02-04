import { synchronize, SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync';
import { Database } from '@nozbe/watermelondb';
import api from './api';
import Registro from '../db/models/Registro';

interface SyncParams {
  database: Database;
  token: string;
}

interface PullChangesResponse {
  changes: SyncDatabaseChangeSet;
  timestamp: number;
}

export async function syncDatabase({ database, token }: SyncParams): Promise<void> {
  
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const params = new URLSearchParams();
      
      if (lastPulledAt) {
        params.append('lastPulledAt', lastPulledAt.toString());
      }

      const url = `/api/sync/pull?${params.toString()}`;

      try {
        const response = await api.get<PullChangesResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error('Failed to pull changes from server');
        }

        return {
          changes: response.data.changes,
          timestamp: response.data.timestamp,
        };
      } catch (error: any) {
        console.error('❌ [SYNC PULL] Erro:', error.message);
        console.error('❌ [SYNC PULL] Response:', error.response?.data);
        console.error('❌ [SYNC PULL] Status:', error.response?.status);
        throw error;
      }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      // Armazenar IDs dos registros que serão enviados
      const registroIdsParaSincronizar: string[] = [];
      
      // Coletar IDs dos registros para atualizar status local
      if (changes.registros) {
        changes.registros.created.forEach((r: any) => {
          registroIdsParaSincronizar.push(r.id);
        });
        
        changes.registros.updated?.forEach((r: any) => {
          registroIdsParaSincronizar.push(r.id);
        });
      }
      
      try {
        await api.post(
          '/api/sync/push',
          {
            changes,
            lastPulledAt,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Atualizar registros locais para sincronizado: true
        if (registroIdsParaSincronizar.length > 0) {
          await database.write(async () => {
            const registrosCollection = database.get<Registro>('registros');
            
            for (const registroId of registroIdsParaSincronizar) {
              try {
                const registro = await registrosCollection.find(registroId);
                await registro.update((r) => {
                  r.sincronizado = true;
                });
              } catch (error) {
                console.warn('⚠️ Sync: Registro', registroId, 'não encontrado localmente');
              }
            }
          });
        }
      } catch (error: any) {
        console.error('❌ [SYNC PUSH] Erro:', error.message);
        console.error('❌ [SYNC PUSH] Response:', error.response?.data);
        console.error('❌ [SYNC PUSH] Status:', error.response?.status);
        throw error;
      }
    },
  });
}
