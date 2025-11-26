@echo off
REM UniChurch - Script de Setup Automático para Windows

echo ============================================
echo   UniChurch - Setup Automatico
echo ============================================
echo.

REM Verifica Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js nao encontrado. Por favor, instale: https://nodejs.org/
    pause
    exit /b 1
)

echo + Node.js encontrado
echo.

echo Instalando dependencias...
echo.

REM Backend
echo Backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo X Erro ao instalar backend
    pause
    exit /b 1
)
echo + Backend instalado
cd ..

REM Mobile
echo Mobile...
cd mobile
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo X Erro ao instalar mobile
    pause
    exit /b 1
)
echo + Mobile instalado
cd ..

echo.
echo Configurando ambiente...

REM Backend .env
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo + Arquivo .env criado em backend\
) else (
    echo i Arquivo .env ja existe
)

echo.
echo ============================================
echo   Setup concluido com sucesso!
echo ============================================
echo.
echo Proximos passos:
echo.
echo 1. Configure o MongoDB
echo    - Local: inicie com 'mongod'
echo    - Atlas: edite backend\.env
echo.
echo 2. Popule o banco:
echo    cd backend
echo    node src\seed.js
echo.
echo 3. Inicie o backend:
echo    cd backend
echo    npm run dev
echo.
echo 4. Configure a API no mobile:
echo    Edite mobile\src\config\api.js
echo.
echo 5. Inicie o app:
echo    cd mobile
echo    npm start
echo.
echo Leia GETTING_STARTED.md para mais detalhes
echo.
pause

