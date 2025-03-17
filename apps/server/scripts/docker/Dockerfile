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

# 设置环境变量
ENV PATH="${PNPM_HOME}:${PATH}" \
  NODE_ENV="${NODE_ENV}" \
  NODE_OPTIONS="--max-old-space-size=8192" \
  PNPM_HOME="${PNPM_HOME}"

RUN corepack enable
RUN npm install -g pnpm@8.15.9 --force

WORKDIR /app

COPY . .
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules
ENV NODE_ENV=development
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts
RUN pnpm prisma:generate
ENV NODE_ENV=production
RUN pnpm run build:server
RUN pnpm --filter @tk-crawler/server --prod deploy /deploy/@tk-crawler/server
RUN cp -r .env.production /deploy
RUN mkdir -p /deploy/certs
RUN cp -r certs/production /deploy/certs
RUN echo "Builder Success 🎉"

# Second stage: Production stage
FROM node:20.11.1-slim AS production
RUN apt-get update -y && apt-get install -y openssl
ENV TZ="Asia/Shanghai"

# Copy only necessary files from the builder stage
COPY --from=builder /deploy /app

WORKDIR /app/@tk-crawler/server

ARG PORT
EXPOSE ${PORT}

CMD ["npm", "run", "start"]
