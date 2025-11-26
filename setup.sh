#!/bin/bash

# UniChurch - Script de Setup Automático
# Este script configura todo o projeto automaticamente

echo "🏗️  UniChurch - Setup Automático"
echo "================================"
echo ""

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verifica MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB não encontrado localmente"
    echo "   Você pode usar MongoDB Atlas ou instalar localmente"
    echo "   Continuando..."
else
    echo "✅ MongoDB encontrado"
fi

echo ""
echo "📦 Instalando dependências..."
echo ""

# Backend
echo "🔧 Backend..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend instalado"
else
    echo "❌ Erro ao instalar backend"
    exit 1
fi
cd ..

# Mobile
echo "📱 Mobile..."
cd mobile
npm install
if [ $? -eq 0 ]; then
    echo "✅ Mobile instalado"
else
    echo "❌ Erro ao instalar mobile"
    exit 1
fi
cd ..

echo ""
echo "⚙️  Configurando ambiente..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Arquivo .env criado em backend/"
else
    echo "ℹ️  Arquivo .env já existe"
fi

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Configure o MongoDB:"
echo "   - Local: inicie com 'mongod'"
echo "   - Atlas: edite backend/.env com sua connection string"
echo ""
echo "2. Popule o banco de dados:"
echo "   cd backend && node src/seed.js"
echo ""
echo "3. Inicie o backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Configure a URL da API no mobile:"
echo "   Edite mobile/src/config/api.js com o IP da sua máquina"
echo ""
echo "5. Inicie o app mobile:"
echo "   cd mobile && npm start"
echo ""
echo "📚 Leia GETTING_STARTED.md para mais detalhes"
echo ""

