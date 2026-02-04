import { synchronize, SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync';
import { Database } from '@nozbe/watermelondb';
import api from './api';

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

      const response = await api.get<PullChangesResponse>(`/sync/pull?${params.toString()}`, {
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
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await api.post(
        '/sync/push',
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
    },
  });
}
