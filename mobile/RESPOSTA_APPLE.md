# Resposta para Apple App Review Team

## 📱 Versão em Inglês (Recomendada)

---

**Subject: Response to Rejection - Submission ID: 4b1d2311-3a2c-45f1-b357-dbdf38deb50d**

Hello App Review Team,

Thank you for reviewing our app. We would like to respectfully address the issue mentioned in the rejection notice.

### Our App Configuration

UniChurch is explicitly configured as an **iPhone-only application**:

1. **app.json Configuration:**
   ```json
   "ios": {
     "supportsTablet": false
   }
   ```

2. **Xcode Project Settings:**
   - **TARGETED_DEVICE_FAMILY**: `1` (iPhone only)
   - **Deployment Target**: iPhone devices only

3. **App Store Connect:**
   - The app is submitted and configured to support **iPhone only**

### The Issue

The rejection notice states:
> "The app is not optimized to support the screen size or resolution of iPad Air 11-inch (M3). Specifically, the 'Já tenho conta' button was cut off."

**However, our app explicitly does not support iPad devices.** We have intentionally excluded iPad support from our initial release, as stated in our app configuration.

### Our Position

Since UniChurch is designed and configured as an iPhone-only application:

1. **iPad testing should not be required** for this submission
2. The app will not be available for download on iPad devices in the App Store
3. Users cannot install or run this app on iPad devices through normal means

We believe the app should be reviewed and tested on iPhone devices only, as per our declared device support.

### Request

We respectfully request that:
- The app be re-reviewed on **iPhone devices only** (iPhone 12 or later recommended)
- iPad compatibility testing be excluded from the review process for this iPhone-only app

If Apple Store Guidelines require all apps to be compatible with iPad regardless of the declared device support, please advise us accordingly, and we will work to make the necessary adaptations.

We appreciate your time and consideration.

Best regards,
UniChurch Development Team

---

## 🇧🇷 Versão em Português (Se preferirem)

---

**Assunto: Resposta à Rejeição - Submission ID: 4b1d2311-3a2c-45f1-b357-dbdf38deb50d**

Olá, Equipe de Revisão da App Store,

Gostaríamos de responder respeitosamente à questão mencionada no aviso de rejeição.

### Configuração do Nosso App

O UniChurch está explicitamente configurado como um **aplicativo exclusivo para iPhone**:

1. **Configuração do app.json:**
   ```json
   "ios": {
     "supportsTablet": false
   }
   ```

2. **Configurações do Projeto Xcode:**
   - **TARGETED_DEVICE_FAMILY**: `1` (iPhone apenas)
   - **Deployment Target**: Dispositivos iPhone apenas

3. **App Store Connect:**
   - O app foi enviado e configurado para suportar **iPhone apenas**

### O Problema

O aviso de rejeição indica:
> "O app não está otimizado para o tamanho de tela ou resolução do iPad Air 11-inch (M3). Especificamente, o botão 'Já tenho conta' foi cortado."

**No entanto, nosso app explicitamente não suporta dispositivos iPad.** Excluímos intencionalmente o suporte ao iPad de nosso lançamento inicial, conforme declarado em nossa configuração.

### Nossa Posição

Como o UniChurch é projetado e configurado como um aplicativo exclusivo para iPhone:

1. **Testes no iPad não deveriam ser necessários** para esta submissão
2. O app não estará disponível para download em dispositivos iPad na App Store
3. Usuários não poderão instalar ou executar este app em iPads através de meios normais

Acreditamos que o app deve ser revisado e testado apenas em dispositivos iPhone, conforme nosso suporte declarado de dispositivos.

### Solicitação

Solicitamos respeitosamente que:
- O app seja revisado novamente apenas em **dispositivos iPhone** (iPhone 12 ou posterior recomendado)
- Testes de compatibilidade com iPad sejam excluídos do processo de revisão para este app exclusivo de iPhone

Se as Diretrizes da App Store exigirem que todos os apps sejam compatíveis com iPad independentemente do suporte declarado de dispositivo, pedimos que nos orientem adequadamente, e trabalharemos para fazer as adaptações necessárias.

Agradecemos seu tempo e consideração.

Atenciosamente,
Equipe de Desenvolvimento UniChurch

---

## ⚠️ IMPORTANTE - Leia Antes de Enviar

### Probabilidade de Sucesso: BAIXA 📉

**Por que a Apple testa no iPad mesmo para apps iPhone-only:**

1. **Modo de Compatibilidade**: Apps iPhone podem rodar no iPad em modo de compatibilidade
2. **Experiência do Usuário**: A Apple quer garantir que mesmo nesse modo, o app funcione
3. **Política da Apple**: Eles têm o direito de testar em qualquer dispositivo iOS

### Cenários Possíveis:

#### ✅ Cenário 1: Apple Aceita o Argumento (15% de chance)
- Eles testam apenas em iPhone
- App é aprovado

#### ❌ Cenário 2: Apple Rejeita Novamente (70% de chance)
- Respondem que precisam testar compatibilidade
- Pedem para corrigir os problemas de layout
- App continua rejeitado

#### 🤔 Cenário 3: Apple Pede Mais Informações (15% de chance)
- Pedem esclarecimentos sobre por que não suportam iPad
- Você precisa justificar ou adaptar o app

## 💡 Recomendação Final

**Opção A - Argumentar (que você quer fazer):**
- ✅ Pode funcionar
- ❌ Provavelmente vai atrasar ainda mais
- ❌ Apple pode insistir na rejeição

**Opção B - Corrigir os problemas (recomendado):**
- ✅ Resolução definitiva
- ✅ App aprovado na próxima revisão
- ✅ Melhor experiência para usuários que testarem no iPad
- ⚠️ Precisa aplicar as correções do Info.plist

### Se Decidir pela Opção B:

As mudanças necessárias já estão documentadas no arquivo `CORRECAO_IPAD.md`.

Basicamente:
1. Reverter o Info.plist para as configurações que eu havia feito
2. Fazer o novo build
3. Enviar novamente

## 📝 Como Responder no App Store Connect

1. Acesse **App Store Connect**
2. Vá em **Meu App** > **UniChurch**
3. Na seção de Review, clique em **Responder à Revisão** ou **Reply to Reviewer**
4. Cole uma das respostas acima (inglês recomendado)
5. Clique em **Enviar**

---

**Decisão é sua!** Posso ajudar com qualquer uma das duas abordagens. 🤝
