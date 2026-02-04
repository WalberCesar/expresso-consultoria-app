import knex from 'knex';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expresso_consultoria_dev',
  },
});

async function seedDatabase() {
  try {
    console.log('Limpando dados existentes...');
    await db('usuarios').del();
    await db('empresas').del();

    console.log('Inserindo empresas...');
    const empresas = await db('empresas').insert([
      {
        nome: 'Empresa A',
        cnpj: '11.111.111/0001-11',
      },
      {
        nome: 'Empresa B',
        cnpj: '22.222.222/0001-22',
      },
    ]);

    const empresaAId = empresas[0]!;
    const empresaBId = empresas[0]! + 1;

    console.log('Gerando senhas...');
    const senhaHash1 = await bcrypt.hash('senha123', 10);
    const senhaHash2 = await bcrypt.hash('senha456', 10);

    console.log('Inserindo usuários...');
    await db('usuarios').insert([
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

    console.log('\n✅ Dados inseridos com sucesso!');
    console.log('\nCredenciais para teste:');
    console.log('\nUsuário 1:');
    console.log('  Email: usuario.a@empresaa.com');
    console.log('  Senha: senha123');
    console.log('  Empresa: Empresa A');
    console.log('\nUsuário 2:');
    console.log('  Email: usuario.b@empresab.com');
    console.log('  Senha: senha456');
    console.log('  Empresa: Empresa B');

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular banco:', error);
    await db.destroy();
    process.exit(1);
  }
}

seedDatabase();
