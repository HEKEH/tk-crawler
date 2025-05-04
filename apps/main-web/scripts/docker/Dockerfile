# First stage: Build stage
FROM node:20.11.1-slim AS builder

ENV PNPM_HOME="/pnpm" \
  PATH="$PNPM_HOME:$PATH" \
  NODE_OPTIONS="--max-old-space-size=8192" \
  TZ="Asia/Shanghai"

RUN corepack enable
RUN npm install -g pnpm@8.15.8 --force

COPY . /app
WORKDIR /app

RUN chmod -R 777 /app

RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules
ENV NODE_ENV=development
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts
ENV NODE_ENV=production
RUN pnpm run build:main-web

RUN echo "Builder Success 🎉"

# Second stage: Production stage
FROM nginx:1.26.2-alpine AS production

RUN echo "types { application/javascript js mjs; }" >/etc/nginx/conf.d/mjs.conf
COPY --from=builder /app/apps/main-web/dist /usr/share/nginx/html

RUN rm -f /etc/nginx/nginx.conf
COPY --from=builder /app/apps/main-web/scripts/docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

# start nginx
CMD ["nginx", "-g", "daemon off;"]
