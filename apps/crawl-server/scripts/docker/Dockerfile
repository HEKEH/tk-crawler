FROM node:20.11.1-slim AS builder
RUN apt-get update -y && apt-get install -y openssl

# # Install only the necessary dependencies for canvas
# RUN apt-get update -y && apt-get install -y \
#   libcairo2-dev \
#   libpango1.0-dev \
#   libjpeg-dev \
#   libgif-dev \
#   librsvg2-dev

# First stage: Build stage

ARG PNPM_HOME="/pnpm"
ARG NODE_ENV=production

ARG ENV_FILE="./.env.production"
ARG PORT

# 设置环境变量
ENV PATH="${PNPM_HOME}:${PATH}" \
  NODE_ENV="${NODE_ENV}" \
  NODE_OPTIONS="--max-old-space-size=8192" \
  PNPM_HOME="${PNPM_HOME}"

RUN corepack enable
RUN npm install -g pnpm@8.15.9 --force

WORKDIR /app

COPY . .
RUN rm -rf apps/server
ENV NODE_ENV=development
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts
RUN pnpm prisma:generate
ENV NODE_ENV=production
RUN pnpm run build:crawl-server
RUN pnpm --filter @tk-crawler/crawl-server --prod deploy /deploy/@tk-crawler/crawl-server
RUN cp ${ENV_FILE} /deploy/.env.production
RUN mkdir -p /deploy/certs
RUN cp -r certs/production /deploy/certs
RUN echo "Builder Success 🎉"

# Second stage: Production stage
FROM node:20.11.1-slim AS production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl procps && rm -rf /var/lib/apt/lists/*
ENV TZ="Asia/Shanghai"

# Copy only necessary files from the builder stage
COPY --from=builder /deploy /app

WORKDIR /app/@tk-crawler/crawl-server

EXPOSE ${PORT}

CMD ["npm", "run", "prod:start"]
