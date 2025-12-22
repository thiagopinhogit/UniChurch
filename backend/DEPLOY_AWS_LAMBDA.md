# Deploy no AWS Lambda - UniChurch Backend

Este guia explica como fazer o deploy do backend do UniChurch no AWS Lambda usando o Serverless Framework.

## 📋 Pré-requisitos

1. **Conta AWS**: Crie uma conta em [aws.amazon.com](https://aws.amazon.com)
2. **Node.js**: Versão 18.x ou superior
3. **AWS CLI**: Instalado e configurado
4. **MongoDB Atlas**: Banco de dados hospedado (recomendado para Lambda)

## 🔧 Configuração Inicial

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar AWS CLI

Instale o AWS CLI se ainda não tiver:

```bash
# macOS
brew install awscli

# Windows (via Chocolatey)
choco install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Configure suas credenciais AWS:

```bash
aws configure
```

Você precisará fornecer:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (ex: us-east-1)
- Default output format (json)

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` baseado no `env.example`:

```bash
cp env.example .env
```

Edite o arquivo `.env` e configure:

```env
MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@seu-cluster.mongodb.net/unichurch?retryWrites=true&w=majority
JWT_SECRET=seu-jwt-secret-super-seguro
NODE_ENV=production
```

### 4. MongoDB Atlas Setup

Se ainda não tem um banco MongoDB na nuvem:

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito (M0)
3. Configure o Network Access para permitir acesso de qualquer IP (0.0.0.0/0) - necessário para Lambda
4. Crie um usuário do banco de dados
5. Obtenha a connection string e configure no `.env`

## 🚀 Deploy

### Deploy em ambiente de desenvolvimento

```bash
npm run deploy:dev
```

### Deploy em ambiente de produção

```bash
npm run deploy:prod
```

### Deploy simples (usa stage 'dev' por padrão)

```bash
npm run deploy
```

Após o deploy, você receberá uma URL como:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

## 🧪 Testar a API

### Verificar health check

```bash
curl https://sua-url-lambda.amazonaws.com/dev/health
```

### Testar localmente antes do deploy

```bash
npm run offline
```

Isso iniciará um servidor local que simula o Lambda:
```
http://localhost:3000
```

## 📊 Monitoramento e Logs

### Ver logs em tempo real

```bash
npm run logs
```

### Ver logs no AWS Console

1. Acesse [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Selecione sua função
3. Vá para a aba "Monitor" > "View logs in CloudWatch"

## 🔄 Atualizar o Deploy

Sempre que fizer alterações no código:

```bash
npm run deploy
```

O Serverless Framework detectará as mudanças e atualizará apenas o necessário.

## 🗑️ Remover o Deploy

Para remover completamente a aplicação da AWS:

```bash
npm run remove
```

⚠️ **Atenção**: Isso removerá todos os recursos criados, incluindo o bucket S3 (se houver arquivos, eles precisam ser deletados primeiro).

## 📱 Atualizar URL do Mobile App

Após o deploy, atualize a URL da API no arquivo do mobile:

```javascript
// mobile/src/config/api.js
export const API_URL = 'https://sua-url-lambda.amazonaws.com/dev/api';
```

## 💾 Upload de Arquivos

O Lambda tem limitações para armazenamento de arquivos. Para uploads de imagens:

### Opção 1: Usar S3 (Recomendado)

O `serverless.yml` já está configurado para criar um bucket S3. Você precisará:

1. Adaptar as rotas que fazem upload para usar o AWS SDK S3
2. Retornar URLs do S3 em vez de caminhos locais

### Opção 2: Usar serviço externo

- Cloudinary
- ImgBB
- AWS S3 diretamente

## 📝 Estrutura de Arquivos

```
backend/
├── src/
│   ├── lambda.js          # Handler do Lambda (novo)
│   ├── server.js          # Servidor Express local
│   ├── models/            # Modelos Mongoose
│   ├── routes/            # Rotas da API
│   └── utils/             # Utilitários
├── serverless.yml         # Configuração do Serverless (novo)
├── package.json           # Dependências e scripts atualizados
└── .env                   # Variáveis de ambiente (não committar)
```

## 🔐 Segurança

1. **Nunca commite** o arquivo `.env` com suas credenciais
2. Use **IAM Roles** com permissões mínimas necessárias
3. Configure **rate limiting** no API Gateway se necessário
4. Use **AWS Secrets Manager** para credenciais sensíveis em produção

## 💰 Custos Estimados

O AWS Lambda tem um **free tier generoso**:
- 1 milhão de requisições gratuitas por mês
- 400.000 GB-segundos de tempo de computação por mês

Para uma aplicação pequena/média, você provavelmente ficará no free tier.

## 🆘 Troubleshooting

### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "User is not authorized to perform: lambda:CreateFunction"

Verifique suas permissões IAM no AWS Console.

### Timeout na conexão com MongoDB

1. Verifique se o MongoDB Atlas está configurado para aceitar conexões de 0.0.0.0/0
2. Aumente o timeout no `serverless.yml` (atualmente 30s)
3. Verifique a connection string no `.env`

### Lambda está frio (cold start)

O primeiro request após um período de inatividade pode ser lento (~2-5s). Isso é normal. Considere:
- Usar **Provisioned Concurrency** (custa dinheiro)
- Implementar um **warming** com CloudWatch Events
- Otimizar o tamanho do pacote

## 📚 Recursos Adicionais

- [Documentação Serverless Framework](https://www.serverless.com/framework/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## 🎯 Próximos Passos

1. ✅ Deploy básico funcionando
2. 🔄 Configurar CI/CD (GitHub Actions, GitLab CI, etc.)
3. 🔐 Migrar secrets para AWS Secrets Manager
4. 📊 Configurar alertas no CloudWatch
5. 🎨 Configurar custom domain (API Gateway + Route 53)
6. 🚀 Implementar cache com API Gateway ou CloudFront

---

**Precisa de ajuda?** Abra uma issue no repositório ou consulte a documentação oficial.

