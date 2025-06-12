#!/bin/bash

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始清理 node_modules 目录...${NC}"

# 查找并删除所有 node_modules 目录
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# 检查是否成功
if [ $? -eq 0 ]; then
  echo -e "${GREEN}所有 node_modules 目录已成功清理！${NC}"
else
  echo -e "${RED}清理过程中出现错误，请检查权限或手动删除。${NC}"
fi
