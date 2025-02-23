FROM mysql:9.2.0

ARG CERT_DIR

# 创建必要的目录
RUN mkdir -p /var/lib/mysql /var/log/mysql /etc/mysql/conf.d
RUN chown -R mysql:mysql /var/lib/mysql /var/log/mysql
# RUN chmod -R 755 /var/lib/mysql /var/log/mysql

# 添加配置文件
COPY my.cnf /etc/mysql/conf.d/my.cnf
RUN chown mysql:mysql /etc/mysql/conf.d/my.cnf
# RUN chmod 755 /etc/mysql/conf.d/my.cnf

# Create the destination directory
RUN mkdir -p /etc/mysql/certs
# # 复制证书文件
# COPY ${CERT_DIR}/ca-cert.pem /etc/mysql/certs/
# COPY ${CERT_DIR}/server-cert.pem /etc/mysql/certs/
# COPY ${CERT_DIR}/server-key.pem /etc/mysql/certs/

# # 设置证书文件权限
# RUN chown -R mysql:mysql /etc/mysql/certs && chmod 644 /etc/mysql/certs/ca-cert.pem && chmod 644 /etc/mysql/certs/server-cert.pem && chmod 600 /etc/mysql/certs/server-key.pem

COPY docker-entrypoint.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/docker-entrypoint.sh

# 设置工作目录
WORKDIR /var/lib/mysql

# 暴露MySQL端口
EXPOSE 3306

# 使用mysql用户运行
USER mysql
