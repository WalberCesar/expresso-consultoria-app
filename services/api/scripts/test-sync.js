const http = require('http');

// Use o token que você recebe ao fazer login
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c3VhcmlvLmFAZW1wcmVzYWEuY29tIiwiZW1wcmVzYV9pZCI6MSwiaWF0IjoxNzcwMjM0ODEwLCJleHAiOjE3NzAzMjEyMTB9.uXIh6gyP71o2Fl__p1bA-NLOdwthM15sixRts57QoiU';

async function testSyncEndpoints() {
  console.log('🧪 Testando endpoints de sincronização...\n');

  // Primeiro, vamos fazer login para obter um token válido
  console.log('1️⃣ Fazendo login para obter token...');
  
  const loginData = JSON.stringify({
    email: 'usuario.a@empresaa.com',
    senha: 'senha123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const token = await new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const data = JSON.parse(body);
          console.log('✅ Login bem-sucedido!');
          console.log(`📝 Token obtido: ${data.token.substring(0, 20)}...`);
          resolve(data.token);
        } else {
          console.error('❌ Login falhou:', res.statusCode, body);
          reject(new Error('Login failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  console.log('\n2️⃣ Testando GET /api/sync/pull...');

  const pullOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/sync/pull?lastPulledAt=0',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  await new Promise((resolve, reject) => {
    const req = http.request(pullOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('✅ Pull endpoint funcionando!');
          console.log('📦 Response:', body.substring(0, 100) + '...');
        } else {
          console.log('❌ Pull endpoint falhou:', body);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error.message);
      reject(error);
    });

    req.end();
  });

  console.log('\n3️⃣ Testando POST /api/sync/push...');

  const pushData = JSON.stringify({
    changes: {
      registros: {
        created: [],
        updated: [],
        deleted: []
      },
      foto_registros: {
        created: [],
        updated: [],
        deleted: []
      }
    },
    lastPulledAt: Date.now()
  });

  const pushOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/sync/push',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': pushData.length
    }
  };

  await new Promise((resolve, reject) => {
    const req = http.request(pushOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log('✅ Push endpoint funcionando!');
          if (body) console.log('📦 Response:', body);
        } else {
          console.log('❌ Push endpoint falhou:', body);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error.message);
      reject(error);
    });

    req.write(pushData);
    req.end();
  });

  console.log('\n✨ Testes finalizados!');
}

testSyncEndpoints().catch(console.error);
