# UniChurch Backend API

Backend API para o aplicativo UniChurch - Sistema de integração para igrejas.

## 🚀 Tecnologias

- Node.js
- Express
- MongoDB / Mongoose
- JWT para autenticação

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- `MONGODB_URI`: URL de conexão com MongoDB
- `PORT`: Porta do servidor (padrão: 3000)
- `JWT_SECRET`: Chave secreta para JWT

3. Inicie o MongoDB localmente ou use MongoDB Atlas

## 🌱 Seed Database

Para popular o banco com dados iniciais (igreja, tags de interesse, grupos):

```bash
node src/seed.js
```

Isso criará:
- Uma igreja de exemplo (QR code: `unichurch-sp-main`)
- Tags de interesse (esportes, profissões, hobbies, ministérios)
- Grupos de exemplo (células, grupos de hobby, etc)

## 🏃 Executar

Desenvolvimento (com auto-reload):
```bash
npm run dev
```

Produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📚 Endpoints da API

### Churches (Igrejas)

- `GET /api/churches/qr/:qr_code_id` - Buscar igreja por QR code
- `GET /api/churches/:id` - Buscar igreja por ID
- `POST /api/churches` - Criar nova igreja

### Users (Usuários)

- `POST /api/users` - Criar usuário (onboarding)
- `GET /api/users/:id` - Buscar usuário por ID
- `PUT /api/users/:id` - Atualizar perfil
- `GET /api/users/church/:church_id/members` - Listar membros da igreja
- `GET /api/users/:id/suggestions` - Sugestões de pessoas
- `POST /api/users/:id/interests` - Adicionar interesse
- `DELETE /api/users/:id/interests/:interest_tag_id` - Remover interesse
- `POST /api/users/:id/welcome` - Dar boas-vindas

### Groups (Grupos)

- `GET /api/groups/church/:church_id` - Listar grupos da igreja
- `GET /api/groups/:id` - Detalhes do grupo
- `POST /api/groups` - Criar grupo
- `POST /api/groups/:id/join` - Entrar no grupo
- `POST /api/groups/:id/leave` - Sair do grupo

### Events (Mural)

- `GET /api/events/church/:church_id` - Listar eventos do mural
- `GET /api/events/:id` - Detalhes do evento

### Interests (Interesses)

- `GET /api/interests` - Listar todas as tags de interesse
- `GET /api/interests?category=ESPORTE` - Filtrar por categoria
- `POST /api/interests` - Criar tag de interesse

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── models/          # Modelos MongoDB
│   │   ├── Church.js
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── InterestTag.js
│   │   ├── UserInterest.js
│   │   ├── GroupMember.js
│   │   ├── Event.js
│   │   └── WelcomeAction.js
│   ├── routes/          # Rotas da API
│   │   ├── church.js
│   │   ├── user.js
│   │   ├── group.js
│   │   ├── event.js
│   │   └── interest.js
│   ├── server.js        # Entrada principal
│   └── seed.js          # Script de seed
├── package.json
└── .env
```

## 🔐 Privacidade

O sistema respeita as configurações de privacidade do usuário:
- `show_profile`: Se false, usuário não aparece em buscas
- `show_whatsapp`: Controla exibição do WhatsApp
- `show_instagram`: Controla exibição do Instagram
- `show_linkedin`: Controla exibição do LinkedIn

## 📊 Lógica de Sugestões

As sugestões de pessoas são calculadas por:
- +1 ponto por interesse em comum
- +1 ponto se mesma célula
- Ordenado por score decrescente
- Limitado a 10 sugestões

## 🎯 Tipos de Eventos (Mural)

- `NEW_MEMBER`: Novo membro se cadastrou
- `FIRST_CELL`: Participou da primeira célula
- `JOIN_GROUP_FIRST_TIME`: Entrou no primeiro grupo
- `JOIN_GROUP`: Entrou em um grupo

## 📝 Notas

- O MVP não inclui autenticação completa (JWT está configurado mas não implementado)
- Upload de imagens está preparado mas não implementado
- Para produção, adicione validações, autenticação e rate limiting

