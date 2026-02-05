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

    const isFirstSync = !lastPulledAt;

    // Multi-tenancy: usuarios filtrados por empresa_id
    const usuariosCreated = await knex('usuarios')
      .where('empresa_id', empresaId)
      .where('created_at', '>', lastPulledDate)
      .select('*');

    const usuariosUpdated = isFirstSync ? [] : await knex('usuarios')
      .where('empresa_id', empresaId)
      .where('updated_at', '>', lastPulledDate)
      .whereRaw('updated_at > created_at')
      .select('*');

    // Multi-tenancy: todas as queries filtram por empresa_id
    const registrosCreated = await knex('registros')
      .where('empresa_id', empresaId)
      .where('created_at', '>', lastPulledDate)
      .select('*');

    const registrosUpdated = isFirstSync ? [] : await knex('registros')
      .where('empresa_id', empresaId)
      .where('updated_at', '>', lastPulledDate)
      .whereRaw('updated_at > created_at')
      .select('*');

    // Multi-tenancy: foto_registros filtrados via JOIN com registros.empresa_id
    const fotoRegistrosCreated = await knex('foto_registros')
      .join('registros', 'foto_registros.registro_id', 'registros.id')
      .where('registros.empresa_id', empresaId)
      .where('foto_registros.created_at', '>', lastPulledDate)
      .select('foto_registros.*');

    const fotoRegistrosUpdated = isFirstSync ? [] : await knex('foto_registros')
      .join('registros', 'foto_registros.registro_id', 'registros.id')
      .where('registros.empresa_id', empresaId)
      .where('foto_registros.updated_at', '>', lastPulledDate)
      .whereRaw('foto_registros.updated_at > foto_registros.created_at')
      .select('foto_registros.*');

    changes.usuarios = {
      created: this.mapToRawRecords(usuariosCreated),
      updated: this.mapToRawRecords(usuariosUpdated),
      deleted: []
    };

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

    try {
      await knex.transaction(async (trx) => {
        for (const tableName of Object.keys(changes)) {
          const tableChanges = changes[tableName];

          if (!tableChanges) {
            continue;
          }

          if (tableName === 'usuarios') {
            for (const record of tableChanges.created) {
              try {
                // Multi-tenancy: empresa_id sempre forçado do token JWT
                const usuarioData = {
                  uuid: record.id,
                  empresa_id: empresaId,
                  nome: record.nome,
                  email: record.email,
                  created_at: new Date(record.created_at),
                  updated_at: new Date(record.updated_at)
                };

                const existingUsuario = await trx('usuarios')
                  .where('uuid', record.id)
                  .where('empresa_id', empresaId)
                  .first();

                if (existingUsuario) {
                  await trx('usuarios')
                    .where('uuid', record.id)
                    .where('empresa_id', empresaId)
                    .update({
                      nome: record.nome,
                      email: record.email,
                      updated_at: new Date(record.updated_at)
                    });
                } else {
                  await trx('usuarios').insert(usuarioData);
                }
              } catch (error) {
                console.error('Erro ao inserir/atualizar usuario:', error);
                rejectedIds.push(record.id);
              }
            }

            for (const record of tableChanges.updated) {
              try {
                // Multi-tenancy: update apenas em usuarios da própria empresa
                await trx('usuarios')
                  .where('uuid', record.id)
                  .where('empresa_id', empresaId)
                  .update({
                    nome: record.nome,
                    email: record.email,
                    updated_at: new Date(record.updated_at)
                  });
              } catch (error) {
                rejectedIds.push(record.id);
              }
            }
          }

          if (tableName === 'registros') {
            for (const record of tableChanges.created) {
              try {
                // Mapear tipo do mobile para o banco (entrada -> COMPRA, saida -> VENDA)
                const tipoMapeado = record.tipo === 'entrada' ? 'COMPRA' : 
                                   record.tipo === 'saida' ? 'VENDA' : 
                                   record.tipo.toUpperCase();
                
                const registroData = {
                  uuid: record.id,
                  empresa_id: empresaId,
                  usuario_id: record.usuario_id,
                  tipo: tipoMapeado,
                  data_hora: new Date(record.data_hora),
                  descricao: record.descricao,
                  sincronizado: true,
                  created_at: new Date(record.created_at),
                  updated_at: new Date(record.updated_at)
                };

                const existingRecord = await trx('registros')
                  .where('uuid', record.id)
                  .where('empresa_id', empresaId)
                  .first();

                if (existingRecord) {
                  await trx('registros')
                    .where('uuid', record.id)
                    .where('empresa_id', empresaId)
                    .update({
                      usuario_id: record.usuario_id,
                      tipo: tipoMapeado,
                      data_hora: new Date(record.data_hora),
                      descricao: record.descricao,
                      sincronizado: true,
                      updated_at: new Date(record.updated_at)
                    });
                } else {
                  // Multi-tenancy: empresa_id sempre forçado do token JWT
                  await trx('registros').insert(registroData);
                }
              } catch (error) {
                console.error('Erro ao inserir/atualizar registro:', error);
                rejectedIds.push(record.id);
              }
            }

            for (const record of tableChanges.updated) {
              try {
                // Mapear tipo do mobile para o banco
                const tipoMapeado = record.tipo === 'entrada' ? 'COMPRA' : 
                                   record.tipo === 'saida' ? 'VENDA' : 
                                   record.tipo.toUpperCase();
                
                // Multi-tenancy: update apenas em registros da própria empresa
                await trx('registros')
                  .where('uuid', record.id)
                  .where('empresa_id', empresaId)
                  .update({
                    usuario_id: record.usuario_id,
                    tipo: tipoMapeado,
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
                // Multi-tenancy: validar que o registro pertence à empresa antes de inserir foto
                const registro = await trx('registros')
                  .where('uuid', record.registro_id)
                  .where('empresa_id', empresaId)
                  .first();

                if (!registro) {
                  rejectedIds.push(record.id);
                  continue;
                }

                await trx('foto_registros').insert({
                  uuid: record.id,
                  registro_id: registro.id,
                  url_foto: record.path_url || record.url_foto || '',
                  path_local: record.path_url || record.path_local || '',
                  created_at: new Date(record.created_at),
                  updated_at: new Date(record.updated_at)
                });
              } catch (error) {
                console.error('Erro ao inserir foto_registro:', error);
                rejectedIds.push(record.id);
              }
            }

            for (const record of tableChanges.updated) {
              try {
                // Multi-tenancy: atualizar apenas fotos cujo registro pertence à empresa
                const fotoRegistro = await trx('foto_registros')
                  .join('registros', 'foto_registros.registro_id', 'registros.id')
                  .where('foto_registros.uuid', record.id)
                  .where('registros.empresa_id', empresaId)
                  .select('foto_registros.id')
                  .first();

                if (!fotoRegistro) {
                  rejectedIds.push(record.id);
                  continue;
                }

                await trx('foto_registros')
                  .where('uuid', record.id)
                  .update({
                    url_foto: record.path_url || record.url_foto || '',
                    path_local: record.path_url || record.path_local || '',
                    updated_at: new Date(record.updated_at)
                  });
              } catch (error) {
                console.error('Erro ao atualizar foto_registro:', error);
                rejectedIds.push(record.id);
              }
            }

            for (const recordId of tableChanges.deleted) {
              try {
                // Multi-tenancy: deletar apenas fotos cujo registro pertence à empresa
                const fotoRegistro = await trx('foto_registros')
                  .join('registros', 'foto_registros.registro_id', 'registros.id')
                  .where('foto_registros.uuid', recordId)
                  .where('registros.empresa_id', empresaId)
                  .select('foto_registros.id')
                  .first();

                if (!fotoRegistro) {
                  rejectedIds.push(recordId);
                  continue;
                }

                await trx('foto_registros')
                  .where('uuid', recordId)
                  .delete();
              } catch (error) {
                console.error('Erro ao deletar foto_registro:', error);
                rejectedIds.push(recordId);
              }
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Erro na sincronização: ${error instanceof Error ? error.message : 'Desconhecido'}`);
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
        
        // Mapear tipo do banco para o mobile (COMPRA -> entrada, VENDA -> saida)
        if (key === 'tipo' && record[key]) {
          rawRecord[key] = record[key] === 'COMPRA' ? 'entrada' : 
                          record[key] === 'VENDA' ? 'saida' : 
                          record[key].toLowerCase();
        }
        // Mapear path_local do banco para path_url do mobile
        else if (key === 'path_local' && record[key]) {
          rawRecord['path_url'] = record[key];
        }
        // Mapear url_foto também para path_url se path_local não existir
        else if (key === 'url_foto' && record[key] && !record.path_local) {
          rawRecord['path_url'] = record[key];
        }
        else if (record[key] instanceof Date) {
          rawRecord[key] = record[key].getTime();
        } else {
          rawRecord[key] = record[key];
        }
      });

      return rawRecord;
    });
  }
}
