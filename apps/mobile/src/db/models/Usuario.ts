import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import Registro from './Registro';

export default class Usuario extends Model {
  static table = 'usuarios';

  static associations = {
    registros: { type: 'has_many' as const, foreignKey: 'usuario_id' },
  };

  @field('nome') nome!: string;
  @field('email') email!: string;
  @field('empresa_id') empresaId!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('registros') registros!: Registro[];
}
