#!/bin/bash

# deprecated, 使用start.ts代替，拥有更好的跨平台支持

cd "$(dirname "$0")"

ENV=${1:-development}
ENV_FILE=".env.${ENV}"
IMAGE_NAME="tk-crawler/custom-redis"
LAST_BUILD_FILE=".last_build_${ENV}"
export IMAGE_VERSION=0.0.1

# 检查环境文件是否存在
if [ ! -f "${ENV_FILE}" ]; then
  echo "Error: ${ENV_FILE} file not found"
  exit 1
fi

# 检查是否需要重新构建
need_rebuild() {
  # 如果没有构建记录文件，需要构建
  if [ ! -f "${LAST_BUILD_FILE}" ]; then
    return 0
  fi

  # 读取最后构建时间，添加错误检查
  if ! LAST_BUILD_TIME=$(cat "${LAST_BUILD_FILE}" 2>/dev/null); then
    echo "Error reading build time file"
    return 0
  fi

  # 检查关键文件是否有更新
  for file in Dockerfile \
    docker-entrypoint.sh \
    redis.template.conf \
    docker-compose.yml \
    start.sh \
    "docker-compose.${ENV}.yml" \
    "${ENV_FILE}"; do
    # 添加文件存在性检查和错误处理
    if [ -f "$file" ]; then
      # 根据操作系统选择正确的 stat 命令
      if [[ "$OSTYPE" == "darwin"* ]]; then
        MODIFIED_TIME=$(stat -f %m "$file" 2>/dev/null)
      else
        MODIFIED_TIME=$(stat -c %Y "$file" 2>/dev/null)
      fi

      if [ $? -ne 0 ]; then
        echo "Error checking modification time for $file"
        continue
      fi

      if [ "$MODIFIED_TIME" -gt "$LAST_BUILD_TIME" ]; then
        echo "File $file has been modified, rebuild needed"
        return 0
      fi
    fi
  done

  return 1
}

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

# 检查是否需要重新构建
if need_rebuild; then
  echo "Building new image..."
  docker-compose -p tk-crawler-redis-${ENV} -f docker-compose.yml -f docker-compose.${ENV}.yml --env-file ${ENV_FILE} build
  # 记录构建时间
  date +%s >"${LAST_BUILD_FILE}"
else
  echo "No rebuild needed, using existing image"
fi

# 启动服务
docker-compose -p tk-crawler-redis-${ENV} -f docker-compose.yml -f docker-compose.${ENV}.yml --env-file ${ENV_FILE} up -d
