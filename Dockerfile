# syntax=docker/dockerfile:1

# ---------- deps: install node_modules from a locked manifest ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder: generate prisma client + build Next ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# A dummy URL so `prisma generate` is happy; no DB is touched during build.
ENV DATABASE_URL="file:/tmp/build.db"
RUN npm run build

# ---------- runner: minimal image that runs `next start` ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/prisma ./prisma

# Data volume for the SQLite database + cached feed snapshot.
RUN mkdir -p /data
VOLUME /data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/feed').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Apply the schema to the mounted volume on start, then launch the server.
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && exec node_modules/.bin/next start -p ${PORT:-3000} -H 0.0.0.0"]
