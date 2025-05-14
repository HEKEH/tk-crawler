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

# 定义日志函数
log_info() {
  echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
  echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# 记录脚本开始执行
log_info "Starting MySQL initialization script"

# 输出环境变量（注意不要输出密码）
log_info "MYSQL_USER: ${MYSQL_USER}"
log_info "TK_CRAWLER_DATABASE: ${TK_CRAWLER_DATABASE}"
log_info "TK_CRAWLER_DATABASE_SHADOW: ${TK_CRAWLER_DATABASE_SHADOW}"

# 创建用户
log_info "Creating MySQL user '${MYSQL_USER}'"

# 使用 caching_sha2_password 认证插件创建用户
mysql --defaults-file=/tmp/mysql.cnf <<-EOSQL
    CREATE USER IF NOT EXISTS 'healthcheck'@'localhost' IDENTIFIED WITH caching_sha2_password BY '${MYSQL_HEALTHCHECK_PASSWORD}';
    GRANT USAGE ON *.* TO 'healthcheck'@'localhost';
    -- 创建影子数据库
    CREATE DATABASE IF NOT EXISTS ${TK_CRAWLER_DATABASE};
    CREATE DATABASE IF NOT EXISTS ${TK_CRAWLER_DATABASE_SHADOW};

    CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED WITH caching_sha2_password BY '${MYSQL_PASSWORD}';
    -- 授予用户权限
    GRANT ALL PRIVILEGES ON ${TK_CRAWLER_DATABASE}.* TO '${MYSQL_USER}'@'%';
    GRANT ALL PRIVILEGES ON ${TK_CRAWLER_DATABASE_SHADOW}.* TO '${MYSQL_USER}'@'%';
    -- 授予复制相关权限
    GRANT REPLICATION CLIENT, REPLICATION SLAVE, SUPER ON *.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL

# 检查上一个命令的执行结果
if [ $? -eq 0 ]; then
  log_info "User creation and privileges setup completed successfully"
else
  log_error "Failed to create user or set privileges"
  exit 1
fi

# 删除临时配置文件
rm -f /tmp/mysql.cnf
