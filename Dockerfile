# ---- Build stage (compiles native better-sqlite3) ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --no-cache python3 make g++ && \
    npm ci --omit=dev && \
    apk del python3 make g++

# ---- Runtime stage ----
FROM node:22-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data && chown -R app:app /app/data

USER app
EXPOSE 3006
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
