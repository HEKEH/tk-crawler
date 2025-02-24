set -e

# 创建临时配置文件
cat >/tmp/mysql.cnf <<EOF
[client]
user=root
password=${MYSQL_ROOT_PASSWORD}
EOF

# 设置配置文件权限
chmod 600 /tmp/mysql.cnf

while ! mysqladmin --defaults-file=/tmp/mysql.cnf ping -h"localhost" --silent; do
  sleep 1
done

# 使用 caching_sha2_password 认证插件创建用户
mysql --defaults-file=/tmp/mysql.cnf <<-EOSQL
    CREATE USER IF NOT EXISTS 'healthcheck'@'localhost'
    IDENTIFIED WITH caching_sha2_password BY '${MYSQL_HEALTHCHECK_PASSWORD}';
    GRANT USAGE ON *.* TO 'healthcheck'@'localhost';
    -- 创建影子数据库
    CREATE DATABASE IF NOT EXISTS ${TK_CRAWLER_DATABASE};
    CREATE DATABASE IF NOT EXISTS ${TK_CRAWLER_DATABASE_SHADOW};

    -- 授予用户权限
    GRANT ALL PRIVILEGES ON ${TK_CRAWLER_DATABASE}.* TO '${MYSQL_USER}'@'%';
    GRANT ALL PRIVILEGES ON ${TK_CRAWLER_DATABASE_SHADOW}.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL

# 删除临时配置文件
rm -f /tmp/mysql.cnf
