# Sistema de Lançamentos Offline-First

Sistema full-stack para gestão de lançamentos financeiros com suporte offline-first, desenvolvido em monorepo. Permite cadastro de lançamentos (entrada/saída) com fotos, funcionando offline e sincronizando automaticamente quando online.

## 📋 Requisitos

### Sistema Operacional

- **Backend**: Linux, macOS ou Windows
- **Mobile**: Android (API 24+) ou iOS (13+)

### Software Necessário

- **Node.js**: versão 18.x ou superior
- **npm**: versão 8.x ou superior (incluído com Node.js)
- **MySQL**: versão 8.0 ou superior
- **Docker** (opcional): para executar MySQL em container
- **Android Studio** ou **Xcode**: para emuladores (opcional)
- **Dispositivo físico**: Android ou iOS com Expo Go instalado (recomendado)

### Ferramentas de Desenvolvimento

- **Git**: para clonar o repositório
- **Expo CLI**: instalado automaticamente como dependência do projeto

## 🚀 Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd expresso-consultoria-app
```

### 2. Configurar o Backend

#### 2.1. Instalar Dependências

```bash
cd services/api
npm install
```

#### 2.2. Configurar Banco de Dados MySQL

**Opção A: Usando Docker (Recomendado)**

```bash
# Na pasta services/api
docker-compose up -d

# Verificar se o container está rodando
docker ps
```

O MySQL estará disponível em `localhost:3306` com as seguintes credenciais:

- **Host**: localhost
- **Port**: 3306
- **Database**: expresso_consultoria_dev
- **User**: root
- **Password**: root

**Opção B: MySQL Local**

1. Instale o MySQL 8.0 no seu sistema
2. Crie o banco de dados:

```sql
CREATE DATABASE expresso_consultoria_dev;
```

#### 2.3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `services/api`:

```bash
# services/api/.env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=expresso_consultoria_dev

JWT_SECRET=seu_secret_jwt_aqui
```

#### 2.4. Executar Migrations

```bash
# Na pasta services/api
npm run migrate
```

#### 2.5. Popular Banco com Dados de Teste (Opcional)

```bash
npm run seed
```

Isso criará 2 empresas e 2 usuários de teste:

- **Empresa A**: usuario.a@empresaa.com / senha123
- **Empresa B**: usuario.b@empresab.com / senha456

### 3. Configurar o Mobile

#### 3.1. Instalar Dependências

```bash
cd apps/mobile
npm install
```

#### 3.2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `apps/mobile`:

```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:3000
```

**IMPORTANTE**: Substitua `<SEU_IP_LOCAL>` pelo IP da sua máquina na rede local:

- **macOS/Linux**: Execute `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: Execute `ipconfig` e procure por IPv4

Exemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

**Não use `localhost` ou `127.0.0.1`** - o dispositivo móvel não conseguirá se conectar!

## 🏃 Executando a Aplicação

### 1. Iniciar o Backend

```bash
# Na pasta services/api
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

Verifique se está funcionando acessando: `http://localhost:3000/health`

### 2. Iniciar o Mobile

```bash
# Na pasta apps/mobile
npm start
```

Isso iniciará o Metro Bundler e exibirá um QR code no terminal.

#### Opções de Execução:

**A. Dispositivo Físico (Recomendado)**

1. Instale o **Expo Go** no seu dispositivo:
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Escaneie o QR code:
   - **Android**: Use o app Expo Go
   - **iOS**: Use a câmera nativa do iPhone

3. Aguarde o carregamento do app

**B. Emulador Android**

```bash
# Certifique-se de ter o Android Studio instalado e um emulador configurado
npm run android
```

**C. Simulador iOS (somente macOS)**

```bash
# Certifique-se de ter o Xcode instalado
npm run ios
```

## 🧪 Como Testar o Modo Offline/Online

### Cenário 1: Criar Lançamento Offline

1. **Desabilite a conexão com a internet** no dispositivo (modo avião ou Wi-Fi desligado)
2. Abra o app e faça login (se já estiver logado, pule)
3. Clique no botão **"+"** para criar um novo lançamento
4. Preencha os campos:
   - Tipo: Entrada ou Saída
   - Data/Hora: Selecione a data desejada
   - Descrição: Digite uma descrição (mínimo 10 caracteres)
   - Fotos: Tire fotos ou selecione da galeria (opcional)
5. Clique em **"Criar Lançamento"**
6. Observe que o lançamento aparece na lista com status **"Pendente"** (ícone de relógio amarelo)

### Cenário 2: Sincronizar Dados

1. **Reative a conexão com a internet** no dispositivo
2. Na tela "Meus Lançamentos", toque no **ícone de sincronização** no canto superior direito
3. Aguarde a mensagem de sucesso
4. Observe que os lançamentos pendentes agora mostram status **"Sincronizado"** (ícone de check verde)

**Ou**, aguarde a sincronização automática que ocorre:

- No login
- Ao navegar entre telas
- Usando o gesto de "pull to refresh" (puxar para baixo)

### Cenário 3: Editar Lançamento Offline

1. **Desabilite a internet** novamente
2. Toque em um lançamento já sincronizado (status verde)
3. Modifique a descrição ou adicione/remova fotos
4. Clique em **"Salvar"**
5. Observe que o status volta para **"Pendente"**
6. **Reative a internet** e sincronize manualmente
7. Verifique que as alterações foram persistidas

### Cenário 4: Verificar Persistência no Banco

Para confirmar que os dados foram sincronizados no MySQL:

```bash
# Com Docker
docker exec -it expresso-mysql mysql -uroot -proot expresso_consultoria_dev

# Ou MySQL local
mysql -uroot -p expresso_consultoria_dev
```

Execute as queries:

```sql
-- Ver lançamentos
SELECT id, tipo, descricao, data_hora, empresa_id, sincronizado FROM registros;

-- Ver fotos dos lançamentos
SELECT id, registro_id, path_local FROM foto_registros;
```

### Cenário 5: Isolamento Multi-Tenant

1. Faça login com **usuario.a@empresaa.com** (senha: senha123)
2. Crie alguns lançamentos
3. Faça logout
4. Faça login com **usuario.b@empresab.com** (senha: senha456)
5. Observe que os lançamentos da Empresa A **não aparecem**
6. Crie lançamentos para a Empresa B
7. Verifique no banco que cada empresa vê apenas seus próprios dados

## 🏗️ Estrutura do Projeto

```
expresso-consultoria-app/
├── apps/
│   └── mobile/                    # App React Native
│       ├── src/
│       │   ├── contexts/          # Context API (Auth)
│       │   ├── db/                # WatermelonDB (models, schema)
│       │   ├── navigation/        # React Navigation
│       │   ├── schemas/           # Validação Zod
│       │   ├── screens/           # Telas do app
│       │   └── services/          # API client e sync
│       ├── .env                   # Variáveis de ambiente
│       └── package.json
│
├── services/
│   └── api/                       # Backend Node.js
│       ├── src/
│       │   ├── controllers/       # Controladores Express
│       │   ├── middlewares/       # Auth, validação
│       │   ├── models/            # Models Knex
│       │   ├── routes/            # Rotas da API
│       │   ├── services/          # Lógica de negócio
│       │   └── validators/        # Validação Zod
│       ├── .env                   # Variáveis de ambiente
│       ├── docker-compose.yml     # MySQL container
│       └── package.json
│
├── docs/
│   └── prd.md                     # Requisitos do projeto
│
└── README.md                      # Este arquivo
```

## 🚀 Tecnologias Utilizadas

### Backend

- **Node.js** + **Express**: Framework web
- **TypeScript**: Tipagem estática
- **MySQL**: Banco de dados relacional
- **Knex.js**: Query builder SQL
- **JWT**: Autenticação stateless
- **Zod**: Validação de dados
- **bcrypt**: Hash de senhas

### Mobile

- **React Native** + **Expo SDK 54**: Framework mobile
- **TypeScript**: Tipagem estática
- **WatermelonDB**: Banco de dados local (SQLite) com suporte offline
- **React Navigation**: Navegação
- **React Hook Form** + **Zod**: Formulários e validação
- **Expo Camera** + **Image Picker**: Captura de fotos
- **NetInfo**: Detecção de conectividade

## 🎯 Funcionalidades Implementadas

- ✅ Autenticação JWT multi-tenant (isolamento por empresa)
- ✅ Cadastro de lançamentos (entrada/saída) com validação
- ✅ Captura e gerenciamento de múltiplas fotos
- ✅ Edição e remoção de lançamentos
- ✅ Sincronização bidirecional offline-first
- ✅ Indicador visual de status de sincronização
- ✅ Sincronização automática e manual
- ✅ Persistência local com WatermelonDB
- ✅ Detecção de conectividade
- ✅ Multi-tenancy (isolamento de dados por empresa)

## 🔐 Credenciais de Teste

Após executar `npm run seed` no backend:

| Email                  | Senha    | Empresa   |
| ---------------------- | -------- | --------- |
| usuario.a@empresaa.com | senha123 | Empresa A |
| usuario.b@empresab.com | senha456 | Empresa B |

## 📝 Notas Importantes

### Limitações Conhecidas

1. **Fotos locais não sincronizam entre dispositivos**: As fotos são armazenadas com URIs locais. Um dispositivo que sincroniza dados de outro não visualizará as fotos antigas. Implementar upload real de arquivos para o servidor está no backlog.

2. **Primeiro acesso requer internet**: O login inicial precisa de conexão para autenticar e baixar dados do servidor.

3. **Schema WatermelonDB v2**: Se você instalou uma versão anterior do app, é necessário desinstalar e reinstalar ou limpar os dados do app para aplicar a nova versão do schema.

### Troubleshooting

**Erro de conexão no mobile:**

- Verifique se o backend está rodando
- Confirme que o IP no `.env` do mobile está correto
- Certifique-se de que o dispositivo e o computador estão na **mesma rede Wi-Fi**
- Desabilite firewalls que possam bloquear a porta 3000

**Erro ao rodar migrations:**

- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Se usar Docker, execute `docker-compose down -v` e suba novamente

**App não carrega no Expo Go:**

- Limpe o cache: `cd apps/mobile && npx expo start -c`
- Reinstale as dependências: `rm -rf node_modules && npm install`

## 📧 Suporte

Para dúvidas ou problemas, consulte a documentação completa em [docs/prd.md](./docs/prd.md).
