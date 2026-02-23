FROM oven/bun:1-debian AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN bun install

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN adduser --system --uid 1001 nextjs
RUN mkdir .next && chown nextjs:bun .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
