# Backend Configuration Updates

## Automatic Features

### 1. Port Management
O servidor agora **automaticamente mata qualquer processo** rodando na porta 3000 antes de iniciar.

### 2. IP Detection
O servidor detecta automaticamente o IP da rede local e exibe no console.

### 3. Mobile Config Sync
Ao iniciar, o backend **atualiza automaticamente** o arquivo `mobile/src/config/api.js` com o IP correto.

## Como Usar

### Iniciar o servidor (desenvolvimento)
```bash
cd backend
npm run dev
```

### O que você verá
```
🔍 Checking port 3000...
🔪 Killed process on port 3000
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

============================================================
🚀 UniChurch API Server Started
============================================================
📍 Local:    http://localhost:3000
📱 Network:  http://192.168.15.108:3000
============================================================

💡 Mobile API URL: http://192.168.15.108:3000/api
✅ Mobile API config updated: http://192.168.15.108:3000/api
```

### Sincronizar IP manualmente (se necessário)
```bash
npm run sync-ip
```

## Features Implementadas

✅ Mata processos na porta 3000 automaticamente (cross-platform: Windows, macOS, Linux)
✅ Detecta IP da rede local automaticamente
✅ Atualiza `mobile/src/config/api.js` automaticamente
✅ Logs claros e informativos com o IP correto
✅ Funciona com `npm start` e `npm run dev`

## Arquivos Criados

- `src/utils/network.js` - Funções para detectar IP e matar processos
- `src/utils/update-mobile-config.js` - Script para atualizar configuração do mobile
- Este README

## Troubleshooting

**Problema**: IP errado detectado
- Execute `npm run sync-ip` manualmente
- Ou edite `mobile/src/config/api.js` manualmente

**Problema**: Porta 3000 ainda ocupada
- O script já tenta matar o processo, mas se persistir:
  - macOS/Linux: `lsof -ti:3000 | xargs kill -9`
  - Windows: `netstat -ano | findstr :3000` e depois `taskkill /F /PID <PID>`

