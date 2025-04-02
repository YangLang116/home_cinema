import scrapy

# 定义基类
class MediaItem(scrapy.Item):
    cover = scrapy.Field()  # 媒体封面
    name = scrapy.Field()  # 媒体名称
    score = scrapy.Field()  # 评分
    area = scrapy.Field()  # 地区
    language = scrapy.Field()  # 语言
    category = scrapy.Field()  # 类型
    release_date = scrapy.Field()  # 上映日期
    duration = scrapy.Field()  # 片长
    director = scrapy.Field()  # 导演
    actors = scrapy.Field()  # 演员
    summary = scrapy.Field()  # 简介
    download_link = scrapy.Field()  # 下载链接

