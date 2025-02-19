#!/bin/bash

cd "$(dirname "$0")"

ENV=${1:-development}
ENV_FILE=".env.${ENV}"

# 检查环境文件是否存在
if [ ! -f "${ENV_FILE}" ]; then
  echo "Error: ${ENV_FILE} file not found"
  exit 1
fi

create_volume_if_not_exists() {
  local volume_name=$1
  if ! docker volume inspect $volume_name >/dev/null 2>&1; then
    echo "Creating volume: $volume_name"
    docker volume create $volume_name
  else
    echo "Volume $volume_name already exists"
  fi
}

create_volume_if_not_exists tk-crawler-redis-${ENV}

export IMAGE_VERSION=0.0.1

# 使用对应的docker-compose文件启动服务
docker-compose -p tk-crawler-redis-${ENV} -f docker-compose.yml -f docker-compose.${ENV}.yml --env-file ${ENV_FILE} up -d
