FROM node:22-slim

# Prisma necesita OpenSSL para hablar con PostgreSQL
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
# Genera el cliente de Prisma para el sistema del contenedor (Linux)
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3001

# La API y el worker usan esta misma imagen; docker-compose.yaml define el comando de cada uno.
CMD ["npm", "run", "dev"]
