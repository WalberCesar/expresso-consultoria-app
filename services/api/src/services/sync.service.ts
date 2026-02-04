import knex from '../database/connection';
import { Changes, RawRecord, PushResponse } from '../types/sync.types';

export class SyncService {
  async pullChanges(
    lastPulledAt: number | null,
    empresaId: number
  ): Promise<{ changes: Changes; timestamp: number }> {
    const timestamp = Date.now();
    const changes: Changes = {};

    const lastPulledDate = lastPulledAt 
      ? new Date(lastPulledAt) 
      : new Date(0);

    const registrosCreated = await knex('registros')
      .where('empresa_id', empresaId)
      .where('created_at', '>', lastPulledDate)
      .select('*');

    const registrosUpdated = await knex('registros')
      .where('empresa_id', empresaId)
      .where('updated_at', '>', lastPulledDate)
      .whereRaw('updated_at > created_at')
      .select('*');

    const fotoRegistrosCreated = await knex('foto_registros')
      .join('registros', 'foto_registros.registro_id', 'registros.id')
      .where('registros.empresa_id', empresaId)
      .where('foto_registros.created_at', '>', lastPulledDate)
      .select('foto_registros.*');

    const fotoRegistrosUpdated = await knex('foto_registros')
      .join('registros', 'foto_registros.registro_id', 'registros.id')
      .where('registros.empresa_id', empresaId)
      .where('foto_registros.updated_at', '>', lastPulledDate)
      .whereRaw('foto_registros.updated_at > foto_registros.created_at')
      .select('foto_registros.*');

    changes.registros = {
      created: this.mapToRawRecords(registrosCreated),
      updated: this.mapToRawRecords(registrosUpdated),
      deleted: []
    };

    changes.foto_registros = {
      created: this.mapToRawRecords(fotoRegistrosCreated),
      updated: this.mapToRawRecords(fotoRegistrosUpdated),
      deleted: []
    };

    return { changes, timestamp };
  }

  async pushChanges(
    changes: Changes,
    empresaId: number
  ): Promise<PushResponse> {
    const rejectedIds: string[] = [];

    for (const tableName of Object.keys(changes)) {
      const tableChanges = changes[tableName];

      if (!tableChanges) {
        continue;
      }

      if (tableName === 'registros') {
        for (const record of tableChanges.created) {
          try {
            await knex('registros').insert({
              uuid: record.id,
              empresa_id: empresaId,
              usuario_id: record.usuario_id,
              tipo: record.tipo,
              data_hora: new Date(record.data_hora),
              descricao: record.descricao,
              sincronizado: true,
              created_at: new Date(record.created_at),
              updated_at: new Date(record.updated_at)
            });
          } catch (error) {
            rejectedIds.push(record.id);
          }
        }

        for (const record of tableChanges.updated) {
          try {
            await knex('registros')
              .where('uuid', record.id)
              .where('empresa_id', empresaId)
              .update({
                usuario_id: record.usuario_id,
                tipo: record.tipo,
                data_hora: new Date(record.data_hora),
                descricao: record.descricao,
                sincronizado: true,
                updated_at: new Date(record.updated_at)
              });
          } catch (error) {
            rejectedIds.push(record.id);
          }
        }
      }

      if (tableName === 'foto_registros') {
        for (const record of tableChanges.created) {
          try {
            const registro = await knex('registros')
              .where('uuid', record.registro_id)
              .where('empresa_id', empresaId)
              .first();

            if (!registro) {
              rejectedIds.push(record.id);
              continue;
            }

            await knex('foto_registros').insert({
              uuid: record.id,
              registro_id: registro.id,
              url_foto: record.url_foto,
              path_local: record.path_local,
              created_at: new Date(record.created_at),
              updated_at: new Date(record.updated_at)
            });
          } catch (error) {
            rejectedIds.push(record.id);
          }
        }

        for (const record of tableChanges.updated) {
          try {
            await knex('foto_registros')
              .where('uuid', record.id)
              .update({
                url_foto: record.url_foto,
                path_local: record.path_local,
                updated_at: new Date(record.updated_at)
              });
          } catch (error) {
            rejectedIds.push(record.id);
          }
        }
      }
    }

    return {
      experimentalRejectedIds: rejectedIds.length > 0 ? rejectedIds : undefined
    };
  }

  private mapToRawRecords(records: any[]): RawRecord[] {
    return records.map(record => {
      const rawRecord: RawRecord = {
        id: record.uuid || String(record.id)
      };
      
      Object.keys(record).forEach(key => {
        if (key === 'uuid' || key === 'id') {
          return;
        }
        
        if (record[key] instanceof Date) {
          rawRecord[key] = record[key].getTime();
        } else {
          rawRecord[key] = record[key];
        }
      });

      return rawRecord;
    });
  }
}
