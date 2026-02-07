FROM node:20-alpine AS deps

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./

RUN npm install

FROM node:20-alpine AS builder

WORKDIR /workspace

COPY --from=deps /app/node_modules ./node_modules

COPY shared ./shared
COPY onchain ./onchain
COPY backend ./backend

WORKDIR /workspace/backend

RUN ln -sf /workspace/node_modules ./node_modules

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

COPY --from=builder /workspace/backend/dist ./dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/backend/package.json ./
COPY --from=builder /workspace/backend/prisma.config.ts ./
COPY --from=builder /workspace/backend/prisma ./prisma

USER backend

EXPOSE 3002

CMD ["node", "dist/backend/server.js"]
