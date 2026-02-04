import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('empresas', (table) => {
    table.increments('id').primary();
    table.string('nome', 255).notNullable();
    table.string('cnpj', 18).unique();
    table.timestamps(true, true);
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('empresas');
}

