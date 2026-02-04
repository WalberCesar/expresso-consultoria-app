# 📱 Guia de Teste - Aplicativo Mobile

## ✅ Configuração Completa

### 1. Servidor API

- **URL**: http://192.168.100.28:3000
- **Status**: ✅ Rodando
- **Porta**: 3000
- **Health Check**: http://192.168.100.28:3000/health

### 2. Banco de Dados MySQL

- **Container**: expresso-mysql (Docker)
- **Status**: ✅ Rodando
- **Porta**: 3306

### 3. Mobile App

- **API URL**: Configurada em `apps/mobile/.env`
- **Endpoint de Login**: `/api/auth/login`

---

## 🧪 Credenciais para Teste

### Usuário 1

```
Email: usuario.a@empresaa.com
Senha: senha123
Empresa: Empresa A (ID: 1)
```

### Usuário 2

```
Email: usuario.b@empresab.com
Senha: senha456
Empresa: Empresa B (ID: 2)
```

---

## 🚀 Como Testar

### 1. Verificar se tudo está rodando

```bash
cd services/api
./scripts/check-server.sh
```

### 2. Iniciar o app mobile

No dispositivo Android físico, abra o aplicativo já instalado.

### 3. Testar Login

1. Abra o app no dispositivo
2. Digite: `usuario.a@empresaa.com`
3. Digite: `senha123`
4. Clique em Login

### 4. Esperado

✅ Login bem-sucedido
✅ Token JWT recebido
✅ Usuário autenticado
✅ Dados do usuário carregados:

- Nome: Usuário A
- Email: usuario.a@empresaa.com
- Empresa ID: 1

---

## 🔧 Comandos Úteis

### Verificar servidor

```bash
lsof -i :3000 | grep LISTEN
```

### Ver logs do servidor

```bash
tail -f /tmp/api-server.log
```

### Testar rota manualmente (da sua máquina)

```bash
node services/api/scripts/simple-test.js
```

### Parar servidor

```bash
pkill -f "nodemon"
```

### Reiniciar servidor

```bash
cd services/api
npm run dev
```

### Parar MySQL

```bash
cd services/api
docker-compose stop
```

### Iniciar MySQL

```bash
cd services/api
docker-compose start
```

---

## 🐛 Troubleshooting

### App não conecta na API

1. Verifique se o servidor está rodando: `lsof -i :3000`
2. Verifique se ambos estão na mesma rede WiFi
3. Verifique o IP em `apps/mobile/.env`
4. Teste o endpoint: `node services/api/scripts/simple-test.js`

### Login retorna erro

1. Verifique se o MySQL está rodando: `docker ps | grep mysql`
2. Verifique se os dados estão no banco:
   ```bash
   docker exec -it expresso-mysql mysql -uroot -proot \
     -e "SELECT * FROM expresso_consultoria_dev.usuarios;"
   ```

### Timeout na requisição

1. Verifique firewall do macOS
2. Verifique se a porta 3000 está acessível na rede
3. Tente acessar de um navegador no celular: http://192.168.100.28:3000/health

---

## 📊 Estrutura das Rotas

### Autenticação

- **POST** `/api/auth/login`
  - Body: `{ "email": "string", "senha": "string" }`
  - Response: `{ "token": "string", "user": {...} }`

### Health Check

- **GET** `/health`
  - Response: `{ "status": "success", "message": "Server is running" }`

---

## ✨ Status Atual

✅ API rodando e respondendo
✅ MySQL rodando no Docker
✅ Dados de teste criados
✅ Mobile configurado corretamente
✅ Rotas testadas e funcionando

**Tudo pronto para testar no dispositivo móvel! 🎉**
