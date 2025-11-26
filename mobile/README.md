# UniChurch Mobile

Aplicativo móvel do UniChurch - Sistema de integração para igrejas construído com React Native e Expo.

## 🚀 Tecnologias

- React Native
- Expo (SDK 50)
- React Navigation
- Axios
- AsyncStorage
- Expo Camera & Image Picker

## 📦 Instalação

1. Instale as dependências:

```bash
cd mobile
npm install
```

2. Configure a URL da API:

Edite o arquivo `src/config/api.js` com a URL do seu backend:

```javascript
export const API_BASE_URL = 'http://seu-ip:3000/api';
// Para iOS: http://localhost:3000/api
// Para Android: http://10.0.2.2:3000/api (emulador) ou http://seu-ip:3000/api (dispositivo físico)
```

## 🏃 Executar

Inicie o servidor Expo:

```bash
npm start
```

Então escolha uma opção:
- Pressione `i` para iOS
- Pressione `a` para Android
- Escaneie o QR code com Expo Go (dispositivo físico)

## 📱 Funcionalidades

### Onboarding
- ✅ Escanear QR Code da igreja
- ✅ Tela de boas-vindas personalizada
- ✅ Cadastro de dados básicos (nome, foto)
- ✅ Seleção de interesses/afinidades
- ✅ Cadastro de redes sociais (WhatsApp, Instagram, LinkedIn)
- ✅ Configuração de privacidade

### Tela Principal - Navegação Bottom Tab

#### 📋 Mural
- Lista de eventos da comunidade
- Eventos: novo membro, primeira célula, entrada em grupos
- Botão "Ver perfil" para cada evento
- Botão "Dar boas-vindas" para novos membros
- Pull to refresh

#### 👥 Pessoas
- Sugestões personalizadas baseadas em interesses comuns
- Lista completa de membros da igreja
- Busca por nome
- Filtro por afinidades
- Respeita configurações de privacidade

#### 🏠 Grupos
- Filtros por tipo: Todos, Células, Esporte, Profissão, Hobby, Ministério
- Lista de grupos com detalhes
- Entrar/sair de grupos
- Link para WhatsApp do grupo (quando disponível)

#### 👤 Perfil
- Edição de dados pessoais
- Gerenciamento de interesses
- Configurações de privacidade
- Edição de redes sociais
- Logout

### Telas de Detalhes

#### Perfil de Pessoa
- Visualização completa do perfil
- Interesses em comum destacados
- Botões para contato (WhatsApp, Instagram, LinkedIn)
- Respeita configurações de privacidade do usuário

#### Detalhes do Grupo
- Descrição completa
- Lista de membros
- Botão para entrar/sair
- Link para grupo de WhatsApp

## 🎨 Design System

O app utiliza um design system consistente definido em `src/styles/theme.js`:

- **Cores**: Primary (Indigo), Secondary (Pink), Background, Text, etc.
- **Espaçamento**: xs, sm, md, lg, xl, xxl
- **Tipografia**: fontSize e fontWeight pré-definidos
- **Sombras**: small, medium, large

## 📂 Estrutura do Projeto

```
mobile/
├── App.js                      # Entrada principal e navegação
├── app.json                    # Configuração do Expo
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── Button.js
│   │   ├── PersonCard.js
│   │   ├── GroupCard.js
│   │   ├── EventCard.js
│   │   └── InterestTag.js
│   ├── screens/                # Telas do aplicativo
│   │   ├── QRScannerScreen.js
│   │   ├── WelcomeScreen.js
│   │   ├── Onboarding*.js
│   │   ├── FeedScreen.js
│   │   ├── PeopleScreen.js
│   │   ├── GroupsScreen.js
│   │   ├── ProfileScreen.js
│   │   └── *DetailScreen.js
│   ├── navigation/             # Configuração de navegação
│   │   └── MainNavigator.js
│   ├── services/               # Serviços e APIs
│   │   ├── api.js
│   │   └── storage.js
│   ├── config/                 # Configurações
│   │   └── api.js
│   └── styles/                 # Estilos e temas
│       └── theme.js
└── assets/                     # Imagens e recursos
```

## 🔐 Privacidade

O usuário tem controle total sobre sua privacidade:
- **Mostrar perfil**: Se desativado, não aparece em buscas
- **Mostrar WhatsApp**: Controla visibilidade do número
- **Mostrar Instagram**: Controla visibilidade do perfil
- **Mostrar LinkedIn**: Controla visibilidade do perfil

## 🎯 Fluxo do Usuário

### Novo Membro (via QR Code)
1. Escaneia QR Code da igreja
2. Vê tela de boas-vindas
3. Preenche dados básicos
4. Seleciona interesses (mínimo 3)
5. Adiciona redes sociais (opcional)
6. Configura privacidade
7. É redirecionado para tela **Pessoas** (Sugestões)

### Membro Existente
1. App abre direto na última tela ativa
2. Pode navegar entre: Mural, Pessoas, Grupos, Perfil

## 📊 Sugestões de Pessoas

O algoritmo de sugestões considera:
- +1 ponto por interesse em comum
- +1 ponto se mesma célula
- Ordenado por score decrescente
- Limitado a 10 sugestões

## 🌐 Integração com Backend

O app se comunica com a API REST através do `src/services/api.js`:

```javascript
// Exemplos de uso
await createUser(userData);
await getUserSuggestions(userId);
await joinGroup(groupId, userId);
await getChurchEvents(churchId);
```

## 📝 Permissões Necessárias

- **Câmera**: Para escanear QR Code
- **Galeria**: Para selecionar foto de perfil

## 🚨 Troubleshooting

### Erro de conexão com API
- Verifique se o backend está rodando
- Confirme a URL da API em `src/config/api.js`
- Para Android no emulador, use `http://10.0.2.2:3000/api`
- Para dispositivo físico, use o IP da sua máquina

### Imagens não aparecem
- Certifique-se de ter a pasta `assets/` com as imagens necessárias
- Para produção, adicione imagens de placeholder

## 🎁 Próximos Passos

Melhorias sugeridas para o futuro:
- [ ] Autenticação JWT completa
- [ ] Upload real de imagens para servidor
- [ ] Notificações push
- [ ] Chat direto entre membros
- [ ] Calendário de eventos
- [ ] Dashboard web para administradores

## 📄 Licença

Este projeto é parte do sistema UniChurch.

