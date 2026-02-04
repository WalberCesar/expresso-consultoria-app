import knex from '../database/connection';
import { Changes, RawRecord } from '../types/sync.types';

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

  private mapToRawRecords(records: any[]): RawRecord[] {
    return records.map(record => {
      const rawRecord: RawRecord = {};
      
      Object.keys(record).forEach(key => {
        if (record[key] instanceof Date) {
          rawRecord[key] = record[key].getTime();
        } else {
          rawRecord[key] = record[key];
        }
      });

      if (record.uuid) {
        rawRecord.id = record.uuid;
      } else if (record.id) {
        rawRecord.id = String(record.id);
      }

      return rawRecord;
    });
  }
}
