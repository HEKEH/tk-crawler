FROM redis:7.4.2-alpine

# RUN apk add --no-cache gettext # 安装gettext，以使用envsubst

# 创建日志目录并设置权限
RUN mkdir -p /data && chown redis:redis /data && chmod 755 /data

# 添加配置文件
COPY redis.template.conf /tmp/redis.template.conf

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 设置工作目录
WORKDIR /data
# 使用非root用户运行
USER redis

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s CMD redis-cli ping || exit 1
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# # 使用配置文件启动Redis
# CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
