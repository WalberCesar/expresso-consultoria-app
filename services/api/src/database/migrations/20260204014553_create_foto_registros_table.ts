import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('foto_registros', (table) => {
    table.increments('id').primary();
    table.string('uuid', 36).notNullable().unique().index();
    table.integer('registro_id').unsigned().notNullable();
    table.string('url_foto', 500).notNullable();
    table.string('path_local', 500);
    table.timestamps(true, true);

    table.foreign('registro_id')
      .references('id')
      .inTable('registros')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.index('registro_id');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('foto_registros');
}

