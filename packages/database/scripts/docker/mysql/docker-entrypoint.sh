#!/bin/sh
set -e # 遇到错误立即退出

while ! mysqladmin ping -h"localhost" --silent; do
  sleep 1
done

# 创建healthcheck用户
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE USER 'healthcheck'@'localhost' IDENTIFIED BY '${MYSQL_HEALTHCHECK_PASSWORD}';
    GRANT USAGE ON *.* TO 'healthcheck'@'localhost';
EOSQL
