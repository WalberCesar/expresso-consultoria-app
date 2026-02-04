import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  await knex('usuarios').del();
  await knex('empresas').del();

  const empresas = await knex('empresas').insert([
    {
      nome: 'Empresa A',
      cnpj: '11.111.111/0001-11',
    },
    {
      nome: 'Empresa B',
      cnpj: '22.222.222/0001-22',
    },
  ]);

  const empresaAId = empresas[0];
  const empresaBId = empresas[0]! + 1;

  const senhaHash1 = await bcrypt.hash('senha123', 10);
  const senhaHash2 = await bcrypt.hash('senha456', 10);

  await knex('usuarios').insert([
    {
      nome: 'Usuário A',
      email: 'usuario.a@empresaa.com',
      senha: senhaHash1,
      empresa_id: empresaAId,
    },
    {
      nome: 'Usuário B',
      email: 'usuario.b@empresab.com',
      senha: senhaHash2,
      empresa_id: empresaBId,
    },
  ]);
}
