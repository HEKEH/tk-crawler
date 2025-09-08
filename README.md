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
pnpm dev:crawl-server
```

### 启动客户端

管理后台客户端

```bash
pnpm dev:crawler-admin-client
```

用户客户端

```bash
pnpm dev:main-web
pnpm dev:main-client
```
