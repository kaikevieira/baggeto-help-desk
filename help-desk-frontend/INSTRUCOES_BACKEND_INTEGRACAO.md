# Integração com Backend (Node/Express/Prisma)
- Defina `VITE_API_URL` no `.env` do frontend (ex.: `VITE_API_URL=http://localhost:4000`).
- O backend usa **cookies** httpOnly; no frontend usamos `fetch` com `credentials: "include"`.
- Fluxo:
  1. Login em `/auth/login` (usuário/senha) — cookies `access_token` e `refresh_token` são definidos.
  2. Rotas privadas exigem usuário no contexto. Mantemos o usuário do login no `localStorage`.
  3. Em recarregamentos, tentamos `/auth/refresh` para restaurar a sessão.
  4. Logout chama `/auth/logout` e limpa `localStorage`.

