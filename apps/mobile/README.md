# Expresso Consultoria - Mobile App

Aplicativo móvel React Native para o sistema de lançamentos offline-first.

## 🚀 Tecnologias

- React Native
- Expo SDK ~54.0
- TypeScript
- React 19.1

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (opcional, mas recomendado)
- Dispositivo físico com Expo Go ou emulador (Android Studio/Xcode)

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Ou usando yarn
yarn install
```

## 💻 Desenvolvimento

```bash
# Iniciar o Metro bundler
npm start

# Executar no Android
npm run android

# Executar no iOS (somente macOS)
npm run ios

# Executar no navegador
npm run web
```

## 📱 Testando o App

### Usando Expo Go (Recomendado para desenvolvimento rápido)

1. Instale o app Expo Go no seu dispositivo:
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Execute `npm start` no terminal

3. Escaneie o QR code que aparece no terminal com:
   - Android: App Expo Go
   - iOS: Câmera nativa do iPhone

### Usando Emulador/Simulador

**Android:**

```bash
# Certifique-se de ter o Android Studio instalado e configurado
npm run android
```

**iOS (somente macOS):**

```bash
# Certifique-se de ter o Xcode instalado
npm run ios
```

## 🏗️ Estrutura do Projeto

```
apps/mobile/
├── assets/           # Imagens, ícones e recursos estáticos
├── App.tsx          # Componente raiz da aplicação
├── index.ts         # Entry point do app
├── app.json         # Configuração do Expo
├── package.json     # Dependências e scripts
└── tsconfig.json    # Configuração TypeScript
```

## 📦 Próximas Etapas

- [ ] Adicionar WatermelonDB para persistência offline
- [ ] Configurar React Navigation
- [ ] Implementar autenticação
- [ ] Adicionar React Hook Form + Zod
- [ ] Integrar Expo Camera e Image Picker

## 🔐 Variáveis de Ambiente

Configurações futuras de API e ambiente serão adicionadas aqui.

## 📝 Scripts

- `npm start` - Inicia o Metro bundler
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS (macOS)
- `npm run web` - Executa no navegador

## 📖 Documentação

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
