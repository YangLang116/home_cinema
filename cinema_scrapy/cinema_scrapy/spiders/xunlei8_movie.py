import scrapy
import re
from cinema_scrapy.items import MediaItem
from cinema_scrapy.utils import (
    is_downloadable,
    sync_db,
    join_array,
    css_string,
    css_array,
)


class Xunlei8MovieSpider(scrapy.Spider):
    name = "xunlei8_movie"
    allowed_domains = ["xunlei8.cc"]
    start_urls = [
        f"https://xunlei8.cc/list-0-0-0-date-{page}-30.html" for page in range(1, 100)
    ]
    visited_urls = set()

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        # 处理详情页URL
        detail_urls = css_array(response, ".bc3ba>.b33c0>.b30de590050ee::attr(href)")
        for detail_url in detail_urls:
            absolute_detail_url = response.urljoin(detail_url)
            self.logger.info(f"Visited Movie Detail Url: {absolute_detail_url}")
            yield scrapy.Request(url=absolute_detail_url, callback=self.parse_detail)

        # 处理下一页URL
        next_page_url = css_string(response, ".pagination>li:last-child>a::attr(href)")
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
        movie_name = css_string(response, ".b586afc9>h1::text")
        if movie_name is None:
            return
        movie_item["name"] = movie_name
        # 提取电影下载链接
        download_url = css_string(response, ".bf8243b9 a.baf6e960dd::attr(href)")
        if not is_downloadable(download_url):
            return
        movie_item["download_link"] = download_url
        movie_item["source"] = "迅雷电影天堂"
        # 提取电影封面
        movie_item["cover"] = css_string(response, ".ba330>img::attr(src)")
        # 提取电影评分
        score_text = css_string(response, ".b586afc9>a>span::text")
        match = re.search(r"(\d+(?:\.\d+)?)", score_text)
        movie_item["score"] = float(match.group(1)) if match else 0.0
        # 提取电影地区
        movie_item["area"] = join_array(
            css_array(response, "p:contains('地区：') a::text")
        )
        # 提取电影语言
        movie_item["language"] = join_array(
            css_string(response, "p:contains('语言：') a::text").split("/")
        )
        # 提取电影类型
        movie_item["category"] = join_array(
            css_array(response, "p:contains('类型：') a::text")
        )
        # 提取电影上映日期
        movie_item["release_date"] = css_string(
            response, "p:contains('上映：') .b06d85d1bf6::text"
        )
        # 提取电影片长
        movie_item["duration"] = css_string(
            response, "p:contains('片长：') .b06d85d1bf6::text"
        )
        # 提取电影导演
        movie_item["director"] = join_array(
            css_array(response, "p:contains('导演：') a::text")
        )
        # 提取电影演员
        movie_item["actors"] = join_array(css_array(response, "p.b86e6c a::text"))
        # 提取电影简介
        summary = css_string(response, "h2.b5f5b3 + p.b1f40f7888::text")
        movie_item["summary"] = re.sub(r"\s", "", summary) if summary else ""

        yield movie_item

    def closed(self, reason):
        sync_db("movie.db")
        print(f"Spider {self.name} closed with reason: {reason}")
