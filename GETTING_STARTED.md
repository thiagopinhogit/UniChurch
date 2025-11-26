# 🎉 UniChurch - Guia de Início Rápido

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) ou use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Expo CLI** global: `npm install -g expo-cli`
- **Expo Go** app no seu celular ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🚀 Passo a Passo - Setup Completo

### 1️⃣ Backend Setup (5 minutos)

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o .env (opcional - configurações padrão funcionam)
# nano .env

# Inicie o MongoDB (se estiver usando localmente)
# mongod

# Em um novo terminal, inicie o servidor
npm run dev

# Você verá: 🚀 Server running on port 3000
```

### 2️⃣ Popule o Banco de Dados (1 minuto)

```bash
# Em outro terminal, ainda na pasta backend
cd backend

# Execute o script de seed
node src/seed.js

# Você verá:
# ✅ Connected to MongoDB
# ✅ Created church: Igreja UniChurch
# ✅ Created 40 interest tags
# ✅ Created 7 groups
# 🎉 Database seeded successfully!
```

**IMPORTANTE:** Anote o QR Code criado: `unichurch-sp-main`

### 3️⃣ Mobile Setup (5 minutos)

```bash
# Entre na pasta mobile
cd mobile

# Instale as dependências
npm install

# Configure a URL da API
# Edite src/config/api.js

# IMPORTANTE: Use o IP da sua máquina, não 'localhost'
# Para descobrir seu IP:
# - macOS/Linux: ifconfig | grep "inet "
# - Windows: ipconfig
# - Procure por algo como: 192.168.1.xxx

# Exemplo de configuração:
# export const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

### 4️⃣ Adicione as Imagens (3 minutos)

Crie a pasta `assets` se não existir e adicione as imagens necessárias:

```bash
cd mobile
mkdir -p assets
```

**Imagens necessárias:**
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)
- `default-avatar.png` (200x200)

**Solução Rápida:** Use o gerador online [appicon.co](https://appicon.co) ou crie placeholders coloridos.

### 5️⃣ Inicie o App (1 minuto)

```bash
# Na pasta mobile
npm start

# Você verá um QR Code no terminal
# Escaneie com o app Expo Go no seu celular

# Ou pressione:
# - 'i' para iOS Simulator (requer macOS + Xcode)
# - 'a' para Android Emulator (requer Android Studio)
```

## 📱 Testando o App

### Primeira Vez no App

1. **Tela QR Scanner** aparecerá
2. Clique em "Escanear QR Code"
3. Se não tiver um QR Code físico, digite manualmente: `unichurch-sp-main`
4. **Tela de Boas-vindas** da Igreja UniChurch aparecerá
5. Clique em "Começar"
6. Complete o onboarding:
   - Nome: "Seu Nome"
   - Foto: (opcional)
   - Selecione pelo menos 3 interesses
   - Adicione redes sociais (opcional)
   - Configure privacidade
7. Você será levado para **Pessoas > Sugestões**

### Navegação

- **Mural**: Veja eventos da comunidade (inicialmente vazio)
- **Pessoas**: Sugestões baseadas em seus interesses
- **Grupos**: Navegue por células, esportes, profissões, etc.
- **Perfil**: Edite suas informações e privacidade

### Testando Funcionalidades

1. **Entre em um Grupo:**
   - Vá em "Grupos"
   - Selecione "Futebol UniChurch"
   - Clique em "Entrar no grupo"
   - ✅ Aparecerá no Mural: "Você entrou no grupo ⚽"

2. **Veja o Mural:**
   - Vá em "Mural"
   - Você verá seu evento de entrada no grupo
   - Clique em "Ver perfil" para ver seu próprio perfil

3. **Explore Pessoas:**
   - Vá em "Pessoas"
   - Veja sugestões baseadas em interesses comuns
   - Clique em "Ver todos os membros"
   - (Inicialmente só você estará lá)

4. **Edite seu Perfil:**
   - Vá em "Perfil"
   - Mude seus interesses
   - Atualize redes sociais
   - Ajuste configurações de privacidade
   - Clique em "Salvar alterações"

## 🎯 Criando Múltiplos Usuários (para testar melhor)

Para ver o sistema funcionando com múltiplas pessoas:

1. Complete o onboarding com um usuário
2. No perfil, clique em "Sair"
3. Escaneie o QR novamente
4. Crie um novo usuário com interesses diferentes
5. Repita 2-3 vezes

Agora você verá:
- Sugestões de pessoas reais
- Múltiplos eventos no mural
- Grupos com vários membros

## 🐛 Troubleshooting

### "Network request failed"
**Problema:** App não consegue conectar ao backend
**Solução:**
1. Verifique se o backend está rodando (`npm run dev`)
2. Confirme o IP correto em `src/config/api.js`
3. Use o IP da sua máquina, não `localhost`
4. Celular e computador devem estar na **mesma rede WiFi**

### "Cannot find module"
**Problema:** Dependências não instaladas
**Solução:**
```bash
cd backend && npm install
cd ../mobile && npm install
```

### "MongoDB connection error"
**Problema:** MongoDB não está rodando
**Solução:**
- **Local:** Execute `mongod` em outro terminal
- **Atlas:** Verifique a connection string no `.env`

### "Camera permissions"
**Problema:** App pede permissão de câmera
**Solução:** Permita o acesso quando solicitado no celular

### Imagens não aparecem
**Problema:** Pasta assets sem as imagens
**Solução:** Adicione pelo menos placeholders nas imagens obrigatórias

## 📊 Dados de Seed

O script `seed.js` cria:

### Igreja
- Nome: Igreja UniChurch
- Cidade: São Paulo
- QR Code: `unichurch-sp-main`

### 40+ Tags de Interesse
- **Esportes:** Futebol, Vôlei, Basquete, Tênis, Corrida, Natação, Ciclismo
- **Profissão:** Empresário, Autônomo, Estudante, CLT, Tecnologia, Saúde, Educação
- **Hobbies:** Música, Games, Leitura, Fotografia, Culinária, Arte, Viagens, Cinema
- **Ministérios:** Louvor, Infantil, Juventude, Intercessão, Mídia, Recepção

### 7 Grupos
1. Célula Centro
2. Célula Zona Sul
3. Futebol UniChurch
4. Grupo de Estudos Bíblicos
5. Empreendedores na Fé
6. Banda de Louvor
7. Grupo de Corrida

## 🎨 Personalizando

### Mudar Cores do App
Edite `mobile/src/styles/theme.js`:
```javascript
export const colors = {
  primary: '#6366F1',      // Cor principal
  secondary: '#EC4899',    // Cor secundária
  // ...
};
```

### Adicionar Mais Interesses
Edite `backend/src/seed.js` e adicione no array:
```javascript
const hobbies = [
  // ...
  { name: 'Yoga', category: 'ESPORTE', emoji: '🧘' }
];
```

Execute novamente: `node src/seed.js`

### Criar Nova Igreja
Use a API:
```bash
curl -X POST http://localhost:3000/api/churches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Igreja",
    "city": "Rio de Janeiro",
    "qr_code_id": "minha-igreja-rj"
  }'
```

## 📚 Próximos Passos

Agora que tudo está funcionando:

1. **Explore o Código:**
   - Backend: `backend/src/routes/` - APIs
   - Mobile: `mobile/src/screens/` - Telas
   - Componentes: `mobile/src/components/` - Reutilizáveis

2. **Personalize:**
   - Mude cores e estilos
   - Adicione mais campos ao perfil
   - Crie novos tipos de grupos

3. **Implemente Melhorias:**
   - Autenticação JWT completa
   - Upload de imagens para servidor
   - Notificações push
   - Chat entre membros

4. **Deploy:**
   - Backend: Railway, Heroku, DigitalOcean
   - Mobile: Build com `eas build`

## 💬 Suporte

Estrutura do projeto funcionando? ✅
- Backend rodando na porta 3000
- MongoDB populado com dados
- App mobile conectando e funcionando
- Todas as telas implementadas

## 🎉 Pronto!

Você agora tem um sistema completo de integração para igrejas rodando localmente!

**Happy Coding! 🚀**

