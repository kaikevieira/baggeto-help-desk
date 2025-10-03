# ---------- Build ----------
FROM node:18-alpine AS build
WORKDIR /help-desk-backend

# Instala TODAS as deps (inclui dev, ex.: prisma CLI)
COPY package*.json ./
RUN npm ci

# Copia somente o necessário para gerar o Prisma Client
COPY prisma ./prisma
COPY src ./src
# Se houver outros arquivos necessários (tsconfig, etc.), copie aqui também:
# COPY tsconfig.json ./

# Gera o Prisma Client durante o build
RUN npx prisma generate


# ---------- Runtime ----------
FROM node:18-alpine
WORKDIR /help-desk-backend
ENV NODE_ENV=production

# Copia node_modules (já com @prisma/client e prisma CLI)
COPY --from=build /help-desk-backend/node_modules ./node_modules
# Copia código e schema
COPY --from=build /help-desk-backend/prisma ./prisma
COPY --from=build /help-desk-backend/src ./src
COPY package*.json ./

# Exponha a porta que você usa localmente (apenas informativo)
# Se seu servidor usa 4000 por padrão, mantenha 4000;
# (Na Koyeb, seu app deve ler process.env.PORT)
EXPOSE 4000

# Aplica migrações e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
