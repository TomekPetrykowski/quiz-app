FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false
COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN npm ci --omit=dev --prefer-offline --no-audit --progress=false && npm cache clean --force

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]