import { database } from '../index';
import { Registro } from '../models';

export async function testDatabaseSetup() {
  try {
    console.log('[DB Test] Starting database setup test...');

    const registrosCollection = database.get<Registro>('registros');
    
    const testRegistro = await database.write(async () => {
      return await registrosCollection.create((registro) => {
        registro.empresaId = 1;
        registro.usuarioId = 1;
        registro.tipo = 'COMPRA';
        registro.dataHora = new Date();
        registro.descricao = 'Teste de registro';
        registro.sincronizado = false;
      });
    });

    console.log('[DB Test] Created test record:', testRegistro.id);

    const foundRegistro = await registrosCollection.find(testRegistro.id);
    console.log('[DB Test] Found record:', foundRegistro.descricao);

    await database.write(async () => {
      await testRegistro.destroyPermanently();
    });

    console.log('[DB Test] ✅ Database setup test passed!');
    return true;
  } catch (error) {
    console.error('[DB Test] ❌ Database setup test failed:', error);
    return false;
  }
}
