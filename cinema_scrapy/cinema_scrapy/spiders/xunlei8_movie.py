import scrapy
import re
from cinema_scrapy.items import MediaItem
from cinema_scrapy.utils import is_downloadable, sync_db


class Xunlei8MovieSpider(scrapy.Spider):
    name = "xunlei8_movie"
    allowed_domains = ["xunlei8.cc"]
    start_urls = ["https://xunlei8.cc/movies.html"]
    visited_urls = set()

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        # 处理详情页URL
        detail_urls = response.css(".bc3ba>.b33c0>.b30de590050ee::attr(href)").getall()
        for detail_url in detail_urls:
            absolute_detail_url = response.urljoin(detail_url)
            self.logger.info(f"Visited Movie Detail Url: {absolute_detail_url}")
            yield scrapy.Request(url=absolute_detail_url, callback=self.parse_detail)

        # 处理下一页URL
        next_page_url = response.css(".pagination>li:last-child>a::attr(href)").get()
        if next_page_url:
            absolute_next_page_url = response.urljoin(next_page_url)
            # 检查URL是否已经访问过
            if absolute_next_page_url not in self.visited_urls:
                self.visited_urls.add(absolute_next_page_url)
                self.logger.info(f"Visited Movie List Url: {absolute_next_page_url}")
                yield scrapy.Request(url=absolute_next_page_url, callback=self.parse)

    def parse_detail(self, response):
        movie_item = MediaItem()
        # 提取电影名称
        movie_name = response.css(".b586afc9>h1::text").get()
        if movie_name is None:
            return
        movie_item["name"] = movie_name
        # 提取电影下载链接
        download_url = response.css(".bf8243b9 a.baf6e960dd::attr(href)").get()
        if not is_downloadable(download_url):
            return
        movie_item["download_link"] = download_url
        movie_item["source"] = '迅雷电影天堂'
        # 提取电影封面
        movie_item["cover"] = response.css(".ba330>img::attr(src)").get()
        # 提取电影评分
        score_text = response.css(".b586afc9>a>span::text").get()
        match = re.search(r"(\d+(?:\.\d+)?)", score_text)
        movie_item["score"] = float(match.group(1)) if match else 0.0
        # 提取电影地区
        movie_item["area"] = ", ".join(
            response.css("p:contains('地区：') a::text").getall()
        )
        # 提取电影语言
        movie_item["language"] = response.css("p:contains('语言：') a::text").get()
        # 提取电影类型
        movie_item["category"] = ", ".join(
            response.css("p:contains('类型：') a::text").getall()
        )
        # 提取电影上映日期
        movie_item["release_date"] = response.css(
            "p:contains('上映：') .b06d85d1bf6::text"
        ).get()
        # 提取电影片长
        movie_item["duration"] = response.css(
            "p:contains('片长：') .b06d85d1bf6::text"
        ).get()
        # 提取电影导演
        movie_item["director"] = response.css("p:contains('导演：') a::text").get()
        # 提取电影演员
        movie_item["actors"] = ", ".join(response.css("p.b86e6c a::text").getall())
        # 提取电影简介
        summary = response.css("h2.b5f5b3 + p.b1f40f7888::text").get()
        movie_item["summary"] = re.sub(r"\s", "", summary)

        yield movie_item

    def closed(self, reason):
        sync_db("movie.db")
        print(f"Spider {self.name} closed with reason: {reason}")
