# Database Structure

Estrutura do banco de dados MySQL para o sistema offline-first.

## 📊 Modelo de Dados

### Tabelas

#### 1. empresas

Armazena informações das empresas no sistema (multi-tenancy).

| Campo      | Tipo         | Constraints    |
| ---------- | ------------ | -------------- |
| id         | INT (PK)     | Auto-increment |
| nome       | VARCHAR(255) | NOT NULL       |
| cnpj       | VARCHAR(18)  | UNIQUE         |
| created_at | TIMESTAMP    | Auto           |
| updated_at | TIMESTAMP    | Auto           |

#### 2. usuarios

Usuários do sistema vinculados a empresas.

| Campo      | Tipo         | Constraints       |
| ---------- | ------------ | ----------------- |
| id         | INT (PK)     | Auto-increment    |
| nome       | VARCHAR(255) | NOT NULL          |
| email      | VARCHAR(255) | NOT NULL, UNIQUE  |
| senha      | VARCHAR(255) | NOT NULL (hash)   |
| empresa_id | INT (FK)     | NOT NULL, CASCADE |
| created_at | TIMESTAMP    | Auto              |
| updated_at | TIMESTAMP    | Auto              |

#### 3. registros

Lançamentos de compra/venda (sincronização offline).

| Campo        | Tipo        | Constraints             |
| ------------ | ----------- | ----------------------- |
| id           | INT (PK)    | Auto-increment          |
| uuid         | VARCHAR(36) | NOT NULL, UNIQUE, INDEX |
| empresa_id   | INT (FK)    | NOT NULL, CASCADE       |
| usuario_id   | INT (FK)    | NOT NULL, CASCADE       |
| tipo         | ENUM        | 'COMPRA', 'VENDA'       |
| data_hora    | DATETIME    | NOT NULL                |
| descricao    | TEXT        | NOT NULL                |
| sincronizado | BOOLEAN     | DEFAULT false           |
| created_at   | TIMESTAMP   | Auto                    |
| updated_at   | TIMESTAMP   | Auto                    |

**Índices:**

- `uuid` (único)
- `[empresa_id, usuario_id]` (composto)
- `sincronizado`

#### 4. foto_registros

Fotos anexadas aos registros.

| Campo       | Tipo         | Constraints             |
| ----------- | ------------ | ----------------------- |
| id          | INT (PK)     | Auto-increment          |
| uuid        | VARCHAR(36)  | NOT NULL, UNIQUE, INDEX |
| registro_id | INT (FK)     | NOT NULL, CASCADE       |
| url_foto    | VARCHAR(500) | NOT NULL                |
| path_local  | VARCHAR(500) | NULL                    |
| created_at  | TIMESTAMP    | Auto                    |
| updated_at  | TIMESTAMP    | Auto                    |

**Índices:**

- `registro_id`

## 🔑 Relacionamentos

```
empresas (1) ─── (N) usuarios
    │
    └─── (N) registros ─── (N) foto_registros
                 │
          usuarios (N) ─── (1)
```

## 🚀 Migrations

### Executar Migrations

```bash
# Executar todas as migrations pendentes
npm run migrate:latest

# Ver status das migrations
npm run migrate:status

# Reverter última migration
npm run migrate:rollback
```

### Criar Nova Migration

```bash
npm run migrate:make nome_da_migration
```

### Ordem de Execução

1. `create_empresas_table`
2. `create_usuarios_table`
3. `create_registros_table`
4. `create_foto_registros_table`

## 📝 Notas Importantes

### Compatibilidade UUID/ID

- **MySQL:** Usa `id` (auto-increment) como PK + `uuid` (string) para compatibilidade
- **WatermelonDB:** Usa `uuid` (string) como identificador principal
- **API:** Aceita e retorna ambos os formatos para flexibilidade

### Multi-tenancy

- Todos os dados são isolados por `empresa_id`
- Usuários só podem ver/modificar dados da sua empresa
- Deletes em cascata garantem integridade referencial

### Sincronização

- Campo `sincronizado` indica se o registro já foi enviado ao servidor
- Campo `uuid` garante unicidade entre cliente e servidor
- Timestamps automáticos para auditoria

## 🔐 Segurança

- Senhas devem ser hasheadas com bcrypt antes de salvar
- Implementar validação de CNPJ no backend
- Foreign keys com CASCADE para integridade
- Índices otimizados para queries frequentes
