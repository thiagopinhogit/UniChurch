# 🎯 Novo Fluxo de Onboarding

## Mudanças Implementadas

### Tela Inicial de Seleção

Agora quando o app abre, o usuário vê uma tela de seleção onde pode escolher:

#### 👤 **Sou membro**
- Navega para o **QR Scanner**
- Escaneia o QR Code da igreja
- Completa o onboarding como membro

#### ⛪ **Sou igreja**
- Navega para **Cadastro de Igreja**
- Preenche dados da igreja
- Recebe QR Code para compartilhar

---

## Fluxo Completo

### Para Membros:
```
Initial Screen
    ↓ [Sou membro]
QR Scanner
    ↓ [Escaneia/Digita código]
Welcome Screen
    ↓
Onboarding: Dados Básicos
    ↓
Onboarding: Interesses
    ↓
Onboarding: Redes Sociais
    ↓
Onboarding: Privacidade
    ↓
App Principal (Feed/Pessoas/Grupos/Perfil)
```

### Para Igrejas:
```
Initial Screen
    ↓ [Sou igreja]
Cadastro de Igreja
    ↓ [Preenche dados]
Tela QR Code
    ↓ [Compartilha QR]
Volta para Initial Screen
```

---

## Arquivos Criados

### 1. **InitialScreen.js**
Tela de seleção inicial com duas opções:
- Design limpo e moderno
- Botões grandes e claros
- Ícones e descrições explicativas

### 2. **ChurchRegistrationScreen.js**
Formulário de cadastro de igreja:
- Nome da igreja
- Cidade
- Código único do QR (gerado automaticamente)
- Logo (opcional)
- Validações completas

### 3. **ChurchQRCodeScreen.js**
Exibe o QR Code gerado:
- QR Code visual
- Código em texto
- Botão de compartilhar
- Instruções de uso

---

## Alterações em Arquivos Existentes

### **App.js**
- Rota inicial mudada de `QRScanner` para `Initial`
- Adicionadas novas rotas para registro de igreja
- Organização melhorada das rotas

### **ProfileScreen.js**
- Logout agora redireciona para `Initial` (não `QRScanner`)

### **services/api.js**
- Nova função: `createChurch(churchData)`

---

## Backend - Endpoint necessário

O cadastro de igreja usa o endpoint:

```javascript
POST /api/churches
{
  "name": "Nome da Igreja",
  "city": "Cidade",
  "qr_code_id": "codigo-unico",
  "logo_url": "https://..."
}
```

Este endpoint já existe no backend!

---

## Testando o Novo Fluxo

### Como Membro:
1. Abra o app
2. Clique em "Escanear QR Code"
3. Digite: `unichurch-sp-main`
4. Complete o onboarding

### Como Igreja:
1. Abra o app
2. Clique em "Cadastrar igreja"
3. Preencha:
   - Nome: "Minha Igreja Teste"
   - Cidade: "Rio de Janeiro"
   - Código: será gerado automaticamente
4. Clique em "Cadastrar igreja"
5. Veja o QR Code gerado
6. Compartilhe com membros

---

## Design

Seguindo o novo sistema de design:
- ✨ Bordas arredondadas (12-24px)
- 💎 Sombras sutis
- 🌊 Muito espaçamento
- 🎨 Cores consistentes com o tema
- 📱 Touch targets adequados (44px mínimo)

---

## Próximos Passos (Opcional)

1. **Dashboard para Igrejas**: Área administrativa
2. **Estatísticas**: Visualizar membros e grupos
3. **Gestão de Grupos**: Criar/editar grupos pela igreja
4. **Notificações**: Avisos para membros

---

*Atualizado em: Novembro 2025*

