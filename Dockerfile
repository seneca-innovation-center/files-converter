# --- Build ---
FROM oven/bun:1-debian AS builder

WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY package.json ./

RUN bun install

RUN chown appuser:appuser /app

USER appuser

COPY --chown=appuser:appuser . .

# Env vars baked into the build (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production

RUN bun run build

USER root
RUN rm -rf node_modules && bun install --production

# --- Runtime ---
FROM oven/bun:1-debian AS runner

WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser appuser

USER appuser

COPY --from=builder --chown=appuser:appuser /app/.next .next
COPY --from=builder --chown=appuser:appuser /app/public public
COPY --from=builder --chown=appuser:appuser /app/package.json .
COPY --from=builder --chown=appuser:appuser /app/node_modules node_modules

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "start"]
