import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly, children, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Usuario from './Usuario';

export default class Registro extends Model {
  static table = 'registros';

  static associations: Associations = {
    foto_registros: { type: 'has_many', foreignKey: 'registro_id' },
    usuarios: { type: 'belongs_to', key: 'usuario_id' },
  };

  @field('empresa_id') empresaId: number;
  @field('usuario_id') usuarioId: number;
  @text('tipo') tipo: string;
  @date('data_hora') dataHora: Date;
  @text('descricao') descricao: string;
  @field('sincronizado') sincronizado: boolean;
  @readonly @date('created_at') createdAt: Date;
  @date('updated_at') updatedAt: Date;

  @children('foto_registros') fotoRegistros: any;
  @relation('usuarios', 'usuario_id') usuario!: Usuario;
}
