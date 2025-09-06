# 家庭影院系统

## 1、使用Docker构建和运行

### 构建Docker镜像

```bash
docker build --no-cache -t home_cinema_dev .
```

### 运行Docker容器

- Mac、Linux
```bash
docker run -d --name home_cinema_dev_container \
    -p 7000:7000 \
    -p 7001:7001 \
    -v ./cinema_scrapy/images:/app/cinema_scrapy/images \
    -v ./cinema_scrapy/backup:/app/cinema_scrapy/backup \
    -v ./cinema_scrapy/movie.db:/app/cinema_scrapy/movie.db \
    -v ./cinema_scrapy/tvshow.db:/app/cinema_scrapy/tvshow.db \
    --restart unless-stopped \
    home_cinema_dev
```

- Windows
```bash
docker run -d --name home_cinema_dev_container -p 7000:7000 -p 7001:7001 -v .\cinema_scrapy\images:/app/cinema_scrapy/images -v .\cinema_scrapy\backup:/app/cinema_scrapy/backup -v .\cinema_scrapy\movie.db:/app/cinema_scrapy/movie.db -v .\cinema_scrapy\tvshow.db:/app/cinema_scrapy/tvshow.db --restart unless-stopped home_cinema_dev
```

## 2、服务端口：
- 后端API: http://host_ip:7000
- 前端Web应用: http://host_ip:7001

## 3、服务说明

### cinema_scrapy

爬虫服务，使用Scrapy框架定时爬取数据

### cinema_server

后端API服务，使用Flask框架开发，提供电影和电视剧数据接口。

### cinema_frontend

前端Web应用，使用React开发，用于展示电影和电视剧数据。

## 4、数据存储

电影和电视剧数据分别存储在以下数据库文件中：
- 电影数据：`/cinema_scrapy/movie.db`
- 电视剧数据：`/cinema_scrapy/tvshow.db`
- 备份目录：`cinema_scrapy/backup`
