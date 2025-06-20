FROM node:22-alpine AS builder

WORKDIR /app
COPY . .
RUN npm ci && npx prisma generate && npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY entrypoint.sh ./

RUN npm ci --omit=dev && chmod +x entrypoint.sh && npm cache clean --force

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]