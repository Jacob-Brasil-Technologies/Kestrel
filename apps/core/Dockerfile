# ==============================================================================
# Kestrel Core — Docker Image
# Build from the monorepo root: docker build -f apps/core/Dockerfile .
# ==============================================================================

# ---- Base ----
FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
# Build tools for native addons (better-sqlite3, bcrypt)
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/types/package.json packages/types/
COPY apps/core/package.json apps/core/
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY packages/types/ packages/types/
COPY apps/core/ apps/core/
RUN pnpm --filter @kestrel/types generate \
    && pnpm --filter @kestrel/core build \
    && pnpm --filter @kestrel/core deploy --prod --legacy /app/deploy

# ---- Production ----
FROM node:22-bookworm-slim

# Runtime dependencies for game servers
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       xz-utils \
       curl \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN if [ "$(dpkg --print-architecture)" = "amd64" ]; then \
        dpkg --add-architecture i386 \
        && apt-get update \
        && apt-get install -y --no-install-recommends lib32gcc-s1 \
        && rm -rf /var/lib/apt/lists/*; \
    fi

# Non-root user — required by game servers like Satisfactory that refuse to run as root
# The node:22-slim base image already includes a "node" user with UID/GID 1000

WORKDIR /app

# Copy production-ready output from pnpm deploy
COPY --from=build /app/deploy ./
COPY --from=build /app/apps/core/dist dist

# Ensure node user owns the app directory
RUN chown -R node:node /app

# Data directory (SQLite DB, runtimes, instances, uploads)
VOLUME /app/data

EXPOSE 3000

USER node

CMD ["node", "dist/main"]
