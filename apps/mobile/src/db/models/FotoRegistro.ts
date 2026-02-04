import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Registro from './Registro';

export default class FotoRegistro extends Model {
  static table = 'foto_registros';

  static associations: Associations = {
    registros: { type: 'belongs_to', key: 'registro_id' },
  };

  @field('registro_id') registroId: string;
  @text('path_url') pathUrl: string;
  @readonly @date('created_at') createdAt: Date;
  @date('updated_at') updatedAt: Date;

  @relation('registros', 'registro_id') registro: Registro;
}
