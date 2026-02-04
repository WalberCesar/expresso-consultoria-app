const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000
    };

    console.log(`\n🧪 Testando ${method} ${path}...`);

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📦 Response:`, body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erro:`, error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`⏱️  Timeout!`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Iniciando testes da API...\n');
  
  // Teste 1: Health check
  try {
    await testEndpoint('/health');
  } catch (error) {
    console.error('Health check falhou');
  }

  // Aguardar 1 segundo
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Teste 2: Login
  try {
    await testEndpoint('/api/auth/login', 'POST', {
      email: 'usuario.a@empresaa.com',
      senha: 'senha123'
    });
  } catch (error) {
    console.error('Login falhou');
  }

  console.log('\n✨ Testes finalizados!');
}

runTests();
