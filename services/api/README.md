# Expresso Consultoria API

Backend API para o sistema de lançamentos offline-first.

## 🚀 Tecnologias

- Node.js
- Express.js
- TypeScript
- Nodemon (desenvolvimento)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
```

## 💻 Desenvolvimento

```bash
# Iniciar servidor em modo desenvolvimento
npm run dev

# Compilar TypeScript
npm run build

# Verificar tipos sem compilar
npm run type-check
```

## 📡 Endpoints

### Health Check
```
GET /health
```
Retorna o status do servidor e informações de uptime.

### Root
```
GET /
```
Retorna informações básicas da API e endpoints disponíveis.

## 🏗️ Estrutura do Projeto

```
src/
├── app.ts        # Configuração do Express
└── server.ts     # Entry point da aplicação
```

## 🔐 Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente de execução (development/production)

## 📝 Scripts

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `npm run build` - Compila o projeto TypeScript para JavaScript
- `npm start` - Inicia o servidor em modo produção
- `npm run type-check` - Verifica erros de tipo sem compilar
- `npm run clean` - Remove a pasta dist

## ✅ Testes

```bash
# Testar health check
curl http://localhost:3000/health

# Testar endpoint raiz
curl http://localhost:3000
```
