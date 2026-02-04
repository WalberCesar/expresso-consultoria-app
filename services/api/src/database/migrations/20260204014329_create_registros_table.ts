import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('registros', (table) => {
    table.increments('id').primary();
    table.string('uuid', 36).notNullable().unique().index();
    table.integer('empresa_id').unsigned().notNullable();
    table.integer('usuario_id').unsigned().notNullable();
    table.enum('tipo', ['COMPRA', 'VENDA']).notNullable();
    table.datetime('data_hora').notNullable();
    table.text('descricao').notNullable();
    table.boolean('sincronizado').defaultTo(false);
    table.timestamps(true, true);

    table.foreign('empresa_id')
      .references('id')
      .inTable('empresas')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.foreign('usuario_id')
      .references('id')
      .inTable('usuarios')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.index(['empresa_id', 'usuario_id']);
    table.index('sincronizado');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('registros');
}

