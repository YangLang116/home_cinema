import scrapy
import re
from cinema_scrapy.items import MediaItem
from cinema_scrapy.utils import (
    is_downloadable,
    sync_db,
    regex_string,
    regex_score,
    regex_array,
    css_string,
    xpath_array,
    css_array,
)


class DyttMovieSpider(scrapy.Spider):
    name = "dytt_movie"
    allowed_domains = ["dytt8899.com"]
    start_urls = ["https://www.dytt8899.com/html/gndy/jddy/index.html"]
    visited_urls = set()

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        # 处理详情页URL，在列表页中找到所有电影链接
        detail_urls = css_array(
            response, "table.tbspan td b a.ulink[href^='/i/']::attr(href)"
        )
        for detail_url in detail_urls:
            absolute_detail_url = response.urljoin(detail_url)
            self.logger.info(f"Visited Movie Detail Url: {absolute_detail_url}")
            yield scrapy.Request(url=absolute_detail_url, callback=self.parse_detail)

        # 处理下一页URL，直接获取下一页的href链接
        next_page = css_string(
            response, "div.co_content8 div.x a:contains('下一页')::attr(href)"
        )
        if next_page:
            absolute_next_page_url = response.urljoin(next_page)
            # 检查URL是否已经访问过
            if absolute_next_page_url not in self.visited_urls:
                self.visited_urls.add(absolute_next_page_url)
                self.logger.info(f"Visited Movie List Url: {absolute_next_page_url}")
                yield scrapy.Request(url=absolute_next_page_url, callback=self.parse)

    def parse_detail(self, response):
        movie_item = MediaItem()
        # 获取Zoom区域的内容
        zoom_content = xpath_array(
            response,
            '//div[@id="Zoom"]/text() | //div[@id="Zoom"]/p/text() | //div[@id="Zoom"]/br/following-sibling::text()',
        )
        zoom_text = "".join(zoom_content)
        # 提取电影名称
        name = regex_string(zoom_text, r"◎片\s*名\s*([^\n◎]+)")
        if not name:
            return
        movie_item["name"] = name
        # 提取电影下载链接（磁力链接）
        download_url = css_string(
            response, "div#downlist a[href^='magnet']::attr(href)"
        )
        if not is_downloadable(download_url):
            return
        movie_item["download_link"] = download_url
        movie_item["source"] = "电影天堂"
        # 提取电影封面
        movie_item["cover"] = css_string(response, "div#Zoom img::attr(src)")
        # 提取电影评分
        movie_item["score"] = regex_score(zoom_text, r"◎豆瓣评分\s*(\d+\.\d+)/10")
        # 提取电影地区
        movie_item["area"] = regex_array(zoom_text, r"◎产\s*地\s*([^\n◎]+)")
        # 提取电影语言
        movie_item["language"] = regex_array(zoom_text, r"◎语\s*言\s*([^\n◎]+)")
        # 提取电影类型并用逗号分隔
        movie_item["category"] = regex_array(zoom_text, r"◎类\s*别\s*([^\n◎]+)")
        # 提取电影上映日期
        movie_item["release_date"] = regex_string(zoom_text, r"◎上映日期\s*([^\n◎]+)")
        # 提取电影片长
        movie_item["duration"] = regex_string(
            zoom_text, r"◎片\s*长\s*([^\n◎]+)"
        ).replace(" Mins", "分钟")
        # 提取电影导演(多行)
        movie_item["director"] = re.sub(
            r"\s+", ",", regex_string(zoom_text, r"◎导\s*演\s*([^\n◎]+)")
        )
        # 提取电影演员（多行）
        movie_item["actors"] = re.sub(
            r"\s+", ",", regex_string(zoom_text, r"◎主\s*演\s*([^\n◎]+)")
        )
        # 提取电影简介
        movie_item["summary"] = re.sub(
            r"\s", "", regex_string(zoom_text, r"◎简\s*介\s*([^◎]+)")
        )

        yield movie_item

    def closed(self, reason):
        sync_db("movie.db")
        print(f"Spider {self.name} closed with reason: {reason}")
