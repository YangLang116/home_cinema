# 选择基础镜像
FROM python:3.9-slim
# 安装基础依赖和工具
RUN apt-get update && apt-get install -y cron tzdata curl nodejs && rm -rf /var/lib/apt/lists/*
ENV TZ Asia/Shanghai
# 复制所有项目文件
COPY . /app/
# 配置cinema_scrapy，创建定时任务
WORKDIR /app/cinema_scrapy
RUN pip install scrapy \
    && SCRAPY_PATH=$(which scrapy) \
    && echo "0 2 * * * cd /app/cinema_scrapy && $SCRAPY_PATH crawl movie 2>> /var/log/cron.log" > /etc/cron.d/cinema-cron \
    && echo "30 2 * * * cd /app/cinema_scrapy && $SCRAPY_PATH crawl tvshow 2>> /var/log/cron.log" >> /etc/cron.d/cinema-cron \
    && chmod 0644 /etc/cron.d/cinema-cron \
    && crontab /etc/cron.d/cinema-cron \
    && touch /var/log/cron.log
# 配置cinema_server
WORKDIR /app/cinema_server
RUN pip install -r requirements.txt && pip install gunicorn
# 构建前端项目
WORKDIR /app/cinema_frontend
RUN npm install --legacy-peer-deps && npm run build && npm install -g serve
# 创建启动脚本
WORKDIR /app
RUN echo '#!/bin/bash\n\
# 启动cron服务\n\
/etc/init.d/cron start\n\
# 启动Flask应用\n\
cd /app/cinema_server && gunicorn -w 4 -b 0.0.0.0:7000 app:app &\n\
# 启动前端服务\n\
cd /app/cinema_frontend && serve -l 7001 -s build &\n\
# 保持容器运行\n\
tail -f /var/log/cron.log\n\
' > /app/start.sh \
    && chmod +x /app/start.sh
# 暴露端口
EXPOSE 7000 7001
# 启动所有服务
CMD ["/app/start.sh"] 
