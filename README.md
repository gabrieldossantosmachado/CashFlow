# CashFlow API

Estrutura inicial de uma API REST com JavaScript e Express, preparada para evoluir via user stories, com autenticação JWT, conexão MongoDB e documentação Swagger.

## Tecnologias

- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- `bcryptjs` para hash de senha
- Swagger UI (`swagger-ui-express`)

## Estrutura de pastas

```txt
src/
  config/
  controllers/
  docs/
  middlewares/
  models/
  routes/
  services/
  app.js
  server.js
```

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```bash
cp .env.example .env
```

Valores esperados:

- `NODE_ENV`
- `PORT`
- `BASE_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## Scripts

- `npm run start`: inicia a API de forma estatica.
- `npm run dev`: inicia com `nodemon` e reinicia automaticamente ao detectar alteracoes.

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Configure o `.env`.
3. Suba o MongoDB localmente ou ajuste `MONGODB_URI`.
4. Execute:

```bash
npm run dev
```

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protegido por Bearer Token)

## Swagger

Documentacao disponivel em:

- `GET /api-docs`

Especificacao OpenAPI em `src/docs/swagger.yaml`.

## Proximos passos sugeridos

- Criar testes automatizados.
- Configurar lint/format.
- Adicionar workflows de CI no GitHub Actions.
- Preparar configuracao de deploy para Vercel.
