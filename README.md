# UniChurch - Sistema de Integração para Igrejas

Sistema completo para facilitar a integração de membros em igrejas médias e grandes, desenvolvido com React Native (Expo) e MongoDB.

## 📖 Visão Geral

O UniChurch resolve o problema de integração em igrejas grandes, onde pessoas se conhecem de vista mas não de verdade. O sistema ajuda:

- **Novos membros** a encontrar pessoas e grupos com afinidades
- **Membros antigos** a criar novos vínculos
- **A igreja** a ter visão da integração da comunidade

## 🏗️ Arquitetura

O projeto é dividido em duas partes principais:

### Backend (Node.js + Express + MongoDB)
- API RESTful completa
- Modelos de dados otimizados
- Sistema de sugestões inteligente
- Controle de privacidade

### Mobile (React Native + Expo)
- App iOS e Android
- Onboarding via QR Code
- 4 telas principais: Mural, Pessoas, Grupos, Perfil
- Interface moderna e intuitiva

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas configurações

# Inicie o MongoDB (localmente ou use MongoDB Atlas)
npm run dev

# Em outro terminal, popule o banco com dados iniciais
node src/seed.js
```

O backend estará rodando em `http://localhost:3000`

### 2. Mobile

```bash
cd mobile
npm install

# Edite src/config/api.js com a URL do seu backend
npm start

# Pressione 'i' para iOS ou 'a' para Android
```

## 📱 Funcionalidades Principais

### 🎯 Onboarding Intuitivo
1. Escanear QR Code da igreja
2. Boas-vindas personalizada
3. Cadastro rápido (nome, foto)
4. Seleção de interesses (esportes, profissão, hobbies)
5. Redes sociais opcionais
6. Controle de privacidade

### 👥 Descoberta de Pessoas
- **Sugestões Inteligentes**: baseadas em interesses comuns
- **Busca Completa**: lista todos os membros
- **Perfis Detalhados**: veja interesses, célula, redes sociais
- **Contato Fácil**: botões diretos para WhatsApp, Instagram, LinkedIn

### 🏠 Grupos e Células
- Filtros por tipo: Células, Esporte, Profissão, Hobby, Ministério
- Entrada/saída simplificada
- Links para grupos de WhatsApp
- Visualização de membros

### 📋 Mural Comunitário
- Eventos em tempo real:
  - Novos membros
  - Primeira participação em célula
  - Entrada em grupos
- Botão "Dar boas-vindas"
- Visualização de perfis

### 👤 Perfil Personalizável
- Edição completa de dados
- Gerenciamento de interesses
- Configurações de privacidade granulares
- Upload de foto

## 🎨 Design System

### Cores
- **Primary**: Indigo (#6366F1) - Espiritual e confiável
- **Secondary**: Pink (#EC4899) - Acolhedor e amigável
- **Background**: Neutro claro (#F9FAFB)

### Componentes Reutilizáveis
- `Button`: botões com variantes (primary, secondary, outline)
- `PersonCard`: card de pessoa com foto e interesses
- `GroupCard`: card de grupo com informações
- `EventCard`: card de evento do mural
- `InterestTag`: tag de interesse selecionável

## 🗄️ Modelo de Dados

### Entidades Principais

#### Church (Igreja)
```javascript
{
  name: String,
  city: String,
  qr_code_id: String (único),
  logo_url: String
}
```

#### User (Usuário)
```javascript
{
  church_id: ObjectId,
  name: String,
  photo_url: String,
  profession: String,
  is_new: Boolean,
  cell_id: ObjectId,
  whatsapp: String,
  instagram: String,
  linkedin: String,
  show_profile: Boolean,
  show_whatsapp: Boolean,
  show_instagram: Boolean,
  show_linkedin: Boolean,
  welcome_count: Number
}
```

#### Group (Grupo)
```javascript
{
  church_id: ObjectId,
  name: String,
  description: String,
  type: ['CELL', 'HOBBY', 'PROFESSION', 'MINISTRY', 'SPORT'],
  emoji: String,
  whatsapp_link: String,
  is_active: Boolean
}
```

#### InterestTag (Tag de Interesse)
```javascript
{
  name: String,
  category: ['ESPORTE', 'PROFISSAO', 'HOBBY', 'MINISTERIO'],
  emoji: String
}
```

#### Event (Evento do Mural)
```javascript
{
  church_id: ObjectId,
  user_id: ObjectId,
  type: ['NEW_MEMBER', 'FIRST_CELL', 'JOIN_GROUP_FIRST_TIME', 'JOIN_GROUP'],
  group_id: ObjectId,
  created_at: Date
}
```

## 🔐 Sistema de Privacidade

Cada usuário controla o que compartilha:

| Configuração | Efeito |
|--------------|--------|
| `show_profile` | Se false, não aparece em buscas |
| `show_whatsapp` | Controla exibição do botão WhatsApp |
| `show_instagram` | Controla exibição do botão Instagram |
| `show_linkedin` | Controla exibição do botão LinkedIn |

## 🧮 Algoritmo de Sugestões

```
score = 0
for cada interesse em comum:
  score += 1

if mesma célula:
  score += 1

ordenar por score decrescente
retornar top 10
```

## 📊 API Endpoints

### Churches
- `GET /api/churches/qr/:qr_code_id` - Buscar por QR
- `GET /api/churches/:id` - Buscar por ID
- `POST /api/churches` - Criar igreja

### Users
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar perfil
- `GET /api/users/church/:church_id/members` - Listar membros
- `GET /api/users/:id/suggestions` - Sugestões personalizadas
- `POST /api/users/:id/interests` - Adicionar interesse
- `DELETE /api/users/:id/interests/:interest_tag_id` - Remover interesse
- `POST /api/users/:id/welcome` - Dar boas-vindas

### Groups
- `GET /api/groups/church/:church_id?type=CELL` - Listar grupos
- `GET /api/groups/:id` - Detalhes do grupo
- `POST /api/groups` - Criar grupo
- `POST /api/groups/:id/join` - Entrar no grupo
- `POST /api/groups/:id/leave` - Sair do grupo

### Events
- `GET /api/events/church/:church_id` - Listar eventos (mural)
- `GET /api/events/:id` - Detalhes do evento

### Interests
- `GET /api/interests?category=ESPORTE` - Listar interesses
- `POST /api/interests` - Criar interesse

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** v18+
- **Express** v4 - Framework web
- **Mongoose** v8 - ODM para MongoDB
- **MongoDB** - Banco de dados NoSQL
- **dotenv** - Variáveis de ambiente

### Mobile
- **React Native** 0.73
- **Expo** SDK 50 - Framework e tooling
- **React Navigation** v6 - Navegação
- **Axios** - Cliente HTTP
- **AsyncStorage** - Persistência local
- **Expo Camera** - Escanear QR
- **Expo Image Picker** - Seleção de fotos

## 📱 Testando o App

### 1. Inicie o Backend
```bash
cd backend
npm run dev
```

### 2. Popule com Dados de Teste
```bash
node src/seed.js
```

Isso criará:
- Igreja "UniChurch São Paulo" (QR: `unichurch-sp-main`)
- 40+ tags de interesse
- 7 grupos de exemplo

### 3. Inicie o App
```bash
cd mobile
npm start
```

### 4. Teste o Fluxo
1. Abra o app
2. Escaneie QR ou digite: `unichurch-sp-main`
3. Complete o onboarding
4. Explore as telas principais

## 🔄 Fluxo de Dados

```
QR Scanner → API (/churches/qr/:id) → Welcome Screen
                                     ↓
                          Onboarding Screens
                                     ↓
                          POST /users (create)
                                     ↓
                          Save to AsyncStorage
                                     ↓
                     Main App (Bottom Tab Navigator)
                     ↓         ↓        ↓        ↓
                  Mural    Pessoas  Grupos   Perfil
```

## 🎯 Casos de Uso

### Novo Visitante
João chega pela primeira vez na igreja:
1. Vê QR Code no hall de entrada
2. Escaneia com seu celular
3. Completa cadastro em 2 minutos
4. Vê sugestões de 8 pessoas com interesses similares
5. Encontra 3 grupos de futebol
6. Entra no grupo "Futebol UniChurch"
7. Aparece no mural: "João entrou no primeiro grupo ⚽"

### Membro Antigo
Maria está há 2 anos na igreja:
1. Abre o app
2. Vê no mural: "Pedro começou a participar da nossa igreja 🎉"
3. Clica em "Ver perfil"
4. Descobre que Pedro também gosta de fotografia
5. Dá boas-vindas
6. Convida Pedro para o grupo de Fotografia

## 📈 Métricas (Futuro)

Dashboard web com:
- Total de membros cadastrados
- Taxa de integração (% com grupo/célula)
- Novos membros por semana
- Grupos mais populares
- Pessoas isoladas (sem grupo/célula)

## 🚀 Deploy

### Backend
```bash
# Opções recomendadas:
- Railway.app (MongoDB incluso)
- Heroku + MongoDB Atlas
- DigitalOcean + MongoDB Atlas
- AWS EC2 + DocumentDB
```

### Mobile
```bash
# Build para produção
expo build:android
expo build:ios

# Ou use EAS Build (recomendado)
eas build --platform android
eas build --platform ios
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/unichurch
JWT_SECRET=sua_chave_secreta_aqui
NODE_ENV=development
```

### Mobile (src/config/api.js)
```javascript
export const API_BASE_URL = 'http://seu-servidor:3000/api';
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi criado para uso em igrejas e comunidades.

## 🙏 Agradecimentos

Desenvolvido com ❤️ para ajudar igrejas a conectarem melhor suas comunidades.

---

**UniChurch** - Transformando frequência em relacionamento real.

