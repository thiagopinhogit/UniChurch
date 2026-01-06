# Sistema de Autenticação de Membros - UniChurch

## 📋 Resumo

Sistema completo de autenticação para membros da igreja, permitindo login e registro através de email/senha, Google ou Apple.

---

## ✅ O que foi implementado

### Backend

#### 1. Modelo User Atualizado (`backend/src/models/User.js`)

**Novos campos adicionados:**
- `password` - Senha criptografada (bcrypt), não retornada nas queries por padrão
- `auth_provider` - Provedor de autenticação: `'email'`, `'google'`, `'apple'` ou `null`
- `provider_user_id` - ID do usuário no provedor OAuth (Google/Apple)

**Métodos:**
- `comparePassword(candidatePassword)` - Valida senha
- Hash automático de senha antes de salvar (bcrypt)

**Índices:**
- `{ email: 1, church_id: 1 }` - Busca rápida por email na igreja
- `{ provider_user_id: 1, auth_provider: 1 }` - Busca rápida por OAuth

#### 2. Rotas de Autenticação (`backend/src/routes/user.js`)

##### `POST /users/login`
Login com email e senha.

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123",
  "church_id": "church_id_here"
}
```

**Resposta (200):**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "_id": "user_id",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "church_id": "church_id",
    "interests": [...]
  }
}
```

**Erros:**
- `400` - Dados faltando
- `401` - Credenciais inválidas ou conta usa login social
- `500` - Erro no servidor

##### `POST /users/register`
Registro com email e senha.

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123",
  "name": "João Silva",
  "church_id": "church_id_here",
  "whatsapp": "+5511999999999",
  "instagram": "@joaosilva",
  "show_profile": true,
  "show_whatsapp": true,
  "show_instagram": false
}
```

**Resposta (201):**
```json
{
  "message": "Conta criada com sucesso",
  "user": {
    "_id": "user_id",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "auth_provider": "email",
    ...
  }
}
```

**Erros:**
- `400` - Dados inválidos, senha muito curta, ou email já cadastrado
- `404` - Igreja não encontrada
- `500` - Erro no servidor

##### `POST /users/oauth`
Login/Registro via OAuth (Google ou Apple).

**Body:**
```json
{
  "provider": "google",
  "provider_user_id": "google_user_id_123",
  "email": "joao@exemplo.com",
  "name": "João Silva",
  "photo_url": "https://...",
  "church_id": "church_id_here"
}
```

**Resposta (200 ou 201):**
```json
{
  "message": "Login realizado com sucesso",
  "user": { ... },
  "isNewUser": false
}
```

**Erros:**
- `400` - Dados incompletos, provedor não suportado, ou email já cadastrado com outro método
- `404` - Igreja não encontrada

---

### Mobile

#### 1. Tela de Seleção de Igreja (`ChurchSelectionScreen.js`)

Tela intermediária onde o usuário informa o código QR da igreja para fazer login ou criar conta.

**Funcionalidades:**
- Input para código QR manual
- Botão para escanear QR Code
- Validação e busca da igreja no backend

#### 2. Tela de Criação de Conta (`MemberSignupScreen.js`)

**Funcionalidades:**
- Formulário completo de registro:
  - Nome completo
  - Email
  - Senha (mínimo 6 caracteres)
  - Confirmação de senha
- Botões de login social:
  - Google (placeholder)
  - Apple (placeholder - apenas iOS)
- Validações em tempo real
- Link para login se já tiver conta
- Integração com dados do onboarding

**Fluxo:**
1. Recebe dados do onboarding (interesses, privacidade, etc.)
2. Usuário preenche credenciais
3. Cria conta no backend
4. Adiciona interesses do usuário
5. Salva localmente no AsyncStorage
6. Navega para app principal

#### 3. Tela de Login (`MemberLoginScreen.js`)

**Funcionalidades:**
- Formulário de login:
  - Email
  - Senha
  - Botão "mostrar/ocultar senha"
- Botões de login social:
  - Google (placeholder)
  - Apple (placeholder - apenas iOS)
- Link "Esqueceu a senha?" (placeholder)
- Link para criar conta
- Validações

**Fluxo:**
1. Usuário informa email e senha
2. Valida credenciais no backend
3. Salva usuário localmente
4. Navega para app principal

#### 4. Atualização do Fluxo de Onboarding

**OnboardingPrivacyScreen.js:**
- Removida criação de usuário direta
- Agora navega para `MemberSignupScreen` com todos os dados coletados
- Usuário cria credenciais antes de finalizar

**InitialScreen.js:**
- Botão "Já tenho conta" agora funcional
- Navega para `ChurchSelectionScreen`

**App.js:**
- Novas rotas adicionadas:
  - `ChurchSelection` - Seleção de igreja
  - `MemberSignup` - Criação de conta
  - `MemberLogin` - Login de membro

---

## 🔄 Fluxo Completo

### Novo Membro (Primeiro Acesso)

```
1. Tela Inicial → "Sou membro" → "Escanear QR Code"
2. Escaneia QR Code da igreja
3. Tela de Boas-vindas
4. Onboarding:
   - Dados básicos (nome, etc.)
   - Esportes e hobbies
   - Interesses
   - Redes sociais
   - WhatsApp
   - Privacidade
5. → MemberSignupScreen (NOVO)
   - Cria credenciais (email/senha ou social)
6. → App Principal
```

### Membro Existente (Login)

```
1. Tela Inicial → "Sou membro" → "Já tenho conta"
2. → ChurchSelectionScreen
   - Digite código QR ou escaneie
3. → MemberLoginScreen
   - Email/senha ou login social
4. → App Principal
```

### Mudou de Celular

```
1. Tela Inicial → "Já tenho conta"
2. Informa código da igreja
3. Faz login
4. Recupera perfil do servidor
```

---

## 🔐 Segurança

### Backend
- Senhas criptografadas com bcrypt (salt 10 rounds)
- Senhas nunca retornadas nas queries (campo `select: false`)
- Validação de duplicidade de email por igreja
- Validação de tamanho mínimo de senha (6 caracteres)

### Mobile
- AsyncStorage para persistência local
- Navegação reset após login (limpa histórico)
- Validações de formulário client-side
- Senhas ocultáveis com botão de "olho"

---

## 📱 OAuth (Google e Apple) - Pendente

O sistema está preparado para OAuth, mas a implementação completa requer:

### Google Sign-In
```bash
npm install @react-native-google-signin/google-signin
```

**Configuração necessária:**
1. Criar projeto no Google Cloud Console
2. Configurar OAuth 2.0 credentials
3. Adicionar Client ID no código
4. Configurar `google-services.json` (Android)
5. Configurar `GoogleService-Info.plist` (iOS)

### Apple Sign-In
```bash
# Já incluído no React Native
```

**Configuração necessária:**
1. Ativar "Sign in with Apple" no Apple Developer Portal
2. Configurar Bundle ID
3. Adicionar capability no Xcode

**Implementação sugerida:**
- Ver `MemberSignupScreen.js` linha ~138
- Ver `MemberLoginScreen.js` linha ~68
- Endpoint já pronto: `POST /users/oauth`

---

## 🧪 Testando

### Criar conta nova:
1. Escaneie QR Code `unichurch-sp-main` (do seed)
2. Complete onboarding
3. Crie conta com email/senha
4. Verifique que interesses foram salvos

### Login existente:
1. Tela inicial → "Já tenho conta"
2. Digite `unichurch-sp-main`
3. Login com credenciais criadas
4. Deve carregar perfil completo

### Backend:
```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "church_id": "CHURCH_ID"
  }'

# Register
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "name": "João Silva",
    "church_id": "CHURCH_ID"
  }'
```

---

## 📝 TODO - Melhorias Futuras

- [ ] Implementar Google Sign-In
- [ ] Implementar Apple Sign-In
- [ ] Recuperação de senha (email)
- [ ] Verificação de email
- [ ] JWT tokens para autenticação stateless
- [ ] Refresh tokens
- [ ] Logout em todos os dispositivos
- [ ] Logs de atividade de login
- [ ] 2FA opcional

---

## 🎯 Arquivos Modificados/Criados

### Backend
- ✏️ `backend/src/models/User.js` - Campos de autenticação
- ✏️ `backend/src/routes/user.js` - Endpoints de auth
- 📦 `backend/package.json` - bcrypt já incluído

### Mobile
- ✨ `mobile/src/screens/MemberSignupScreen.js` - NOVO
- ✨ `mobile/src/screens/MemberLoginScreen.js` - NOVO
- ✨ `mobile/src/screens/ChurchSelectionScreen.js` - NOVO
- ✏️ `mobile/src/screens/OnboardingPrivacyScreen.js` - Atualizado
- ✏️ `mobile/src/screens/InitialScreen.js` - Botão login ativado
- ✏️ `mobile/App.js` - Novas rotas

---

## 💡 Observações

1. **Compatibilidade**: Sistema funciona com onboarding existente sem quebrar nada
2. **Opcional**: OAuth pode ser adicionado depois sem afetar email/senha
3. **Migração**: Usuários sem senha podem ser migrados gradualmente
4. **Privacidade**: Senhas nunca são logadas ou expostas

---

**Data de implementação:** Janeiro 2025  
**Versão:** 1.0.0

