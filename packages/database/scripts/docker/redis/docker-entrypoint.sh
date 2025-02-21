#!/bin/sh
set -e # 遇到错误立即退出
# 使用 envsubst 将配置文件中的环境变量替换成实际值，并输出到一个临时文件
# envsubst </tmp/redis.template.conf >/tmp/redis.conf

# 复制模板文件
cp /tmp/redis.template.conf /tmp/redis.conf

# 使用 sed 替换特定的环境变量
sed -i \
  -e "s|\${REDIS_MEMORY_LIMIT}|$REDIS_MEMORY_LIMIT|g" \
  -e "s|\${REDIS_USERNAME}|$REDIS_USERNAME|g" \
  -e "s|\${REDIS_PASSWORD}|$REDIS_PASSWORD|g" \
  -e "s|\${LOG_LEVEL}|$LOG_LEVEL|g" \
  /tmp/redis.conf
# 启动 Redis，使用替换后的配置文件
exec redis-server /tmp/redis.conf
