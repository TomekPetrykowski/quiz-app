FROM node:22-alpine AS builder

WORKDIR /app
COPY . .
RUN npm ci && npx tsc

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm ci && npm cache clean --force

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/app.js"]