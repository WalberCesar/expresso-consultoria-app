import knex, { Knex } from 'knex';
import config from '../config/knexfile';

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment];

if (!knexConfig) {
  throw new Error(`Configuração do Knex não encontrada para o ambiente: ${environment}`);
}

const db: Knex = knex(knexConfig);

export default db;
