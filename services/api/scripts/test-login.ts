import axios from 'axios';

async function testLogin() {
  try {
    console.log('🧪 Testando rota de login...\n');
    
    const credentials = {
      email: 'usuario.a@empresaa.com',
      senha: 'senha123'
    };
    
    console.log('📤 Enviando requisição:', JSON.stringify(credentials, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Resposta recebida:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.error('\n❌ Erro na requisição:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else if (error.request) {
      console.error('Nenhuma resposta recebida do servidor');
      console.error('Erro:', error.message);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testLogin();
