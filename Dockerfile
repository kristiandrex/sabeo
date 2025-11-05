FROM node:24.11.0-alpine3.22 AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


FROM node:24.11.0-alpine3.22 AS runner

WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "run", "start"]
