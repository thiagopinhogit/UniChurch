// Placeholder para criar as imagens necessárias
// Você pode usar qualquer editor de imagens ou ferramentas online

/*
  IMAGENS NECESSÁRIAS PARA O APP:

  📁 mobile/assets/

  1. icon.png (1024x1024)
     - Ícone principal do app
     - Sugestão: Logo da igreja ou símbolo cristão moderno
     - Formato: PNG com fundo transparente ou sólido

  2. splash.png (1242x2436 ou maior)
     - Tela de abertura do app
     - Sugestão: Logo centralizado com fundo #6366F1 (indigo)
     - Formato: PNG

  3. adaptive-icon.png (1024x1024 - Android)
     - Versão adaptativa do ícone para Android
     - Área segura: 66% central
     - Formato: PNG com fundo transparente

  4. favicon.png (48x48 - Web)
     - Favicon para versão web
     - Formato: PNG

  5. default-avatar.png (200x200)
     - Avatar padrão quando usuário não tem foto
     - Sugestão: Silhueta de pessoa ou ícone de usuário
     - Formato: PNG com fundo transparente ou cinza claro

  FERRAMENTAS RECOMENDADAS:
  - Canva (gratuito, templates prontos)
  - Figma (design profissional)
  - https://appicon.co (gerador de ícones)
  - https://makeappicon.com (gera todos os tamanhos)

  PLACEHOLDERS RÁPIDOS:
  Enquanto isso, você pode usar cores sólidas:
  - icon.png: Círculo indigo (#6366F1) com emoji ⛪
  - splash.png: Fundo indigo com emoji ⛪ centralizado
  - default-avatar.png: Círculo cinza (#E5E7EB) com emoji 👤

  Para criar rapidamente, use: https://placeholder.com/
  Ou execute o script abaixo em Node.js com 'sharp' instalado
*/

// Script Node.js para criar placeholders (opcional)
// npm install sharp
// node create-placeholders.js

const sharp = require('sharp');

async function createPlaceholders() {
  // Icon
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    }
  })
  .png()
  .toFile('icon.png');

  // Splash
  await sharp({
    create: {
      width: 1242,
      height: 2436,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    }
  })
  .png()
  .toFile('splash.png');

  // Adaptive Icon
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    }
  })
  .png()
  .toFile('adaptive-icon.png');

  // Favicon
  await sharp({
    create: {
      width: 48,
      height: 48,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    }
  })
  .png()
  .toFile('favicon.png');

  // Default Avatar
  await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 4,
      background: { r: 229, g: 231, b: 235, alpha: 1 }
    }
  })
  .png()
  .toFile('default-avatar.png');

  console.log('✅ Placeholders criados com sucesso!');
}

// Para usar: node create-placeholders.js
// createPlaceholders();

