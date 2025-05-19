# 家庭影院系统

该项目包含三个主要服务：

1. **cinema_scrapy**: 爬虫服务，用于抓取电影和电视剧数据
2. **cinema_server**: 后端API服务，提供数据接口
3. **cinema_frontend**: 前端Web应用，用于展示电影和电视剧

## 使用Docker构建和运行

### 构建Docker镜像

```bash
docker build --no-cache -t home_cinema .
```

### 运行Docker容器

```bash
docker run -d -p 7000:7000 -p 7001:7001 --name home_cinema_container home_cinema
```

服务端口：
- 后端API: http://localhost:7000
- 前端Web应用: http://localhost:7001

## 服务说明

### cinema_scrapy

爬虫自动在以下时间执行：
- 电影爬虫：每天凌晨2:00执行
- 电视剧爬虫：每天凌晨5:00执行

### cinema_server

后端API服务，使用Flask框架开发，提供电影和电视剧数据接口。

### cinema_frontend

前端Web应用，使用React开发，用于展示电影和电视剧数据。

## 数据存储

电影和电视剧数据分别存储在以下数据库文件中：
- 电影数据：`/cinema_scrapy/movie.db`
- 电视剧数据：`/cinema_scrapy/tvshow.db`
- 备份目录：`cinema_scrapy/backup`
