# TK Crawler

## 启动项目(开发环境)

### 启动服务端

如果尚未在本地启动数据库，请先启动数据库

```bash
pnpm docker:redis:dev
pnpm docker:mysql:dev
pnpm prisma:migrate
pnpm prisma:seed
```

启动服务

```bash
pnpm dev:server
pnpm dev:crawler-server
```

### 启动自动关注助手客户端

```bash
pnpm dev:mobile-follow-client
```

### 打包自动关注助手客户端

```bash
pnpm build:mobile-follow-client
```
