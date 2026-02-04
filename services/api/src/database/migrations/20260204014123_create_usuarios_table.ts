import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('nome', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('senha', 255).notNullable();
    table.integer('empresa_id').unsigned().notNullable();
    table.timestamps(true, true);

    table.foreign('empresa_id')
      .references('id')
      .inTable('empresas')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('usuarios');
}

