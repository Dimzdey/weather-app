# Base stage for shared configurations
FROM node:20 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Production dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Development dependencies
FROM base AS dev-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Build stage for compiling project
FROM base AS build
COPY --from=dev-deps /app/node_modules /app/node_modules
RUN pnpm run build

# Production build
FROM base AS production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma db push && node dist/main.js"]

# Development build
FROM base AS development
WORKDIR /app
COPY --from=dev-deps /app/node_modules /app/node_modules
RUN pnpm prisma generate


