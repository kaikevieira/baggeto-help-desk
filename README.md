<div align="center">

<img src="help-desk-frontend/public/logo.png" alt="Baggeto" width="96" height="96" />

# Baggeto Help Desk

Gestão de chamados com foco em transporte/logística. Backend Node + Prisma (PostgreSQL) e Frontend React + Vite + Tailwind.

[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-black?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#licença)

</div>

## Índice

- Visão geral
- Funcionalidades
- Stack e arquitetura
- Estrutura do projeto
- Como rodar (dev)
- Variáveis de ambiente
- Banco de dados e Prisma
- Endpoints principais
- Deploy (Koyeb + Vercel)
- Troubleshooting
- Screenshots
- Roadmap
- Licença

---

## Visão geral

Aplicação full stack para abertura e acompanhamento de chamados com recursos voltados ao transporte (rota por estados com mapa do Brasil, pedágio, placas, representantes etc.). Autenticação por cookies httpOnly (access/refresh) e RBAC (USER/ADMIN).

## Funcionalidades

- Autenticação com refresh automático e cookies httpOnly
- Perfis USER/ADMIN com escopo de visualização e ações
- Dashboard com contadores e últimos chamados
- Chamados (CRUD) com comentários e atribuição
- Campos de transporte: cidade/UF, rota por estados no mapa, placas, pedágio, tomador, representantes
- UX moderna: skeletons, modais com scroll lock, responsividade

## Stack e arquitetura

```
React (Vite) ──► API HTTP (Express)
	 ▲                │
	 │                ▼
Tailwind         Prisma ORM ──► PostgreSQL
```

## Estrutura do projeto

```
help-desk-backend/   # API Express + Prisma
help-desk-frontend/  # SPA React (Vite)
```

---

## Como rodar (dev)

Pré-requisitos: Node 18+ e PostgreSQL disponíveis.

1) Backend
- Entre em `help-desk-backend/`
- Crie `.env` (veja próxima seção)
- Instale e prepare Prisma:
	- npm ci
	- npm run prisma:generate
	- npm run prisma:migrate
	- npm run prisma:seed (cria admin `admin/!B@ggeto.1020` – altere em prod)
- Inicie: npm run dev

2) Frontend
- Entre em `help-desk-frontend/`
- Crie `.env` com `VITE_API_URL=http://localhost:4000`
- Instale e rode:
	- npm ci
	- npm run dev

Abra http://localhost:5173 no navegador.

---

## Variáveis de ambiente

Backend (`help-desk-backend/.env`):

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# JWT
JWT_ACCESS_SECRET="sua_chave"
JWT_REFRESH_SECRET="sua_chave"

# App
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173  # pode listar múltiplas origens separadas por vírgula
COOKIE_SECURE=false               # em produção: true
```

Frontend (`help-desk-frontend/.env`):

```
VITE_API_URL=http://localhost:4000
```

Notas de produção:
- Use HTTPS no frontend e backend.
- Cookies cross-site exigem `SameSite=None` e `Secure=true` (já tratado no código quando `NODE_ENV=production`).
- Defina `CLIENT_URL` como a URL exata do frontend.

---

## Banco de dados e Prisma

- Schema: `help-desk-backend/prisma/schema.prisma`
- Migrações: `help-desk-backend/prisma/migrations/`
- Seed: cria usuário admin padrão (`admin/!B@ggeto.1020`).

Comandos úteis:

```
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Endpoints principais (resumo)

- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/register`, `GET /auth/me`
- Users (ADMIN): `GET /users`, `POST /users`, `PUT /users/:id`
- Tickets: `GET /tickets`, `POST /tickets`, `GET /tickets/:id`, `PUT /tickets/:id`, `DELETE /tickets/:id`
- Comments: `GET /tickets/:id/comments`, `POST /tickets/:id/comments`
- Health: `GET /health` (200), `GET /` (OK)

Permissões:
- USER: vê chamados criados por ele ou atribuídos a ele
- ADMIN: vê todos e gerencia usuários

---

## Deploy (Koyeb + Vercel)

Backend (Koyeb):
- `PORT=8000`, `NODE_ENV=production`
- `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL=https://seu-frontend`
- Health check HTTP em `/health`, porta 8000
- Dockerfile já preparado (gera Prisma Client no build e `migrate deploy` no start)

Frontend (Vercel):
- `VITE_API_URL=https://sua-api` (HTTPS)
- `vercel.json` com rewrites do SPA:

```
{
	"version": 2,
	"routes": [
		{ "handle": "filesystem" },
		{ "src": "/.*", "dest": "/index.html" }
	]
}
```

---

## Troubleshooting

- 404 nas rotas do SPA (Vercel): confirme `vercel.json` com `handle: filesystem` antes do rewrite
- Health check falha: porta/rota incorretas (use 8000 e `/health` no Koyeb)
- Cookies não persistem:
	- Frontend em HTTPS e `credentials: "include"`
	- Backend em produção define `SameSite=None` + `Secure=true`
	- `CLIENT_URL` precisa bater exatamente com o domínio do front

---

## Screenshots

Adicione suas capturas em `docs/screenshots` e referencie aqui. Exemplos:

![Login](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
![Mapa de Rota](docs/screenshots/rota.png)

---

## Roadmap

- [ ] Filtro avançado de tickets (múltiplos campos)
- [ ] Exportação (CSV/Excel)
- [ ] Notificações em tempo real
- [ ] Testes automatizados (unitários e e2e)

---

## Licença

Projeto para uso interno/educacional (privado).
