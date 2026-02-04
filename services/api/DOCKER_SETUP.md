# Instruções para configurar o MySQL com Docker

## 1. Instalar Docker Desktop

Baixe e instale o Docker Desktop para macOS:
https://www.docker.com/products/docker-desktop

Ou instale via Homebrew:

```bash
brew install --cask docker
```

Após a instalação, abra o Docker Desktop e aguarde ele iniciar completamente.

## 2. Iniciar o MySQL

No diretório `services/api`, execute:

```bash
docker-compose up -d
```

Isso irá:

- Baixar a imagem do MySQL 8.0
- Criar um container chamado `expresso-mysql`
- Criar o banco de dados `expresso_consultoria_dev`
- Expor a porta 3306
- Persistir os dados em um volume Docker

## 3. Verificar se está rodando

```bash
docker ps
```

Você deve ver o container `expresso-mysql` rodando.

## 4. Executar as migrations

```bash
npm run migrate
```

## 5. Popular o banco com dados de teste

```bash
npx ts-node scripts/seed-test-data.ts
```

## Comandos úteis

### Parar o MySQL

```bash
docker-compose stop
```

### Parar e remover o container

```bash
docker-compose down
```

### Parar e remover incluindo volumes (apaga todos os dados)

```bash
docker-compose down -v
```

### Ver logs do MySQL

```bash
docker-compose logs -f mysql
```

### Acessar o MySQL via terminal

```bash
docker exec -it expresso-mysql mysql -uroot -proot expresso_consultoria_dev
```

## Credenciais do banco

- Host: `127.0.0.1` ou `localhost`
- Port: `3306`
- Database: `expresso_consultoria_dev`
- Root User: `root`
- Root Password: `root`
- App User: `expresso`
- App Password: `expresso123`
