# Sistema de Lançamentos Offline-First

Sistema full-stack para gestão de lançamentos com suporte offline-first, desenvolvido em monorepo.

## 📋 Visão Geral

Aplicação composta por:

- **Mobile App**: React Native (Expo) com sincronização offline
- **Backend API**: Node.js/Express com MySQL

## 🏗️ Estrutura do Projeto

```
.
├── apps/
│   └── mobile/          # Aplicativo React Native (Expo)
├── services/
│   └── api/            # Backend Node.js/Express
├── docs/               # Documentação do projeto
└── README.md           # Este arquivo
```

## 🚀 Stack Tecnológica

### Mobile (apps/mobile)

- React Native + Expo SDK
- TypeScript
- WatermelonDB (banco de dados local offline-first)
- React Navigation
- React Hook Form + Zod
- Expo Camera + Image Picker

### Backend (services/api)

- Node.js + Express
- TypeScript
- MySQL
- Sequelize/Knex
- bcrypt (autenticação)

## 🎯 Funcionalidades Principais

- ✅ Autenticação multi-tenant
- ✅ Gestão de lançamentos (compra/venda)
- ✅ Suporte offline com sincronização bidirecional
- ✅ Upload de múltiplas fotos
- ✅ Isolamento de dados por empresa

## 📖 Documentação

Consulte a [documentação completa](./docs/prd.md) para detalhes sobre requisitos e arquitetura.

## 🔧 Desenvolvimento

_Instruções de setup serão adicionadas nas próximas tarefas._
