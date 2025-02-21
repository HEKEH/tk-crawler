FROM mysql:9.2.0

# 创建必要的目录
RUN mkdir -p /var/lib/mysql /var/log/mysql /etc/mysql/conf.d
RUN chown -R mysql:mysql /var/lib/mysql /var/log/mysql
# RUN chmod -R 755 /var/lib/mysql /var/log/mysql

# 添加配置文件
COPY my.cnf /etc/mysql/conf.d/my.cnf
RUN chown mysql:mysql /etc/mysql/conf.d/my.cnf
# RUN chmod 755 /etc/mysql/conf.d/my.cnf

# # 添加初始化脚本
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 设置工作目录
WORKDIR /var/lib/mysql

# 暴露MySQL端口
EXPOSE 3306

# 使用mysql用户运行
USER mysql

COPY docker-entrypoint.sh /docker-entrypoint-initdb.d/
