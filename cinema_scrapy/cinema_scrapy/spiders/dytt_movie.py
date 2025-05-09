import scrapy
import re
import json
from cinema_scrapy.items import MediaItem
from cinema_scrapy.utils import is_downloadable, sync_db


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
        detail_urls = response.css(
            "table.tbspan td b a.ulink[href^='/i/']::attr(href)"
        ).getall()
        for detail_url in detail_urls:
            absolute_detail_url = response.urljoin(detail_url)
            self.logger.info(f"Visited Movie Detail Url: {absolute_detail_url}")
            yield scrapy.Request(url=absolute_detail_url, callback=self.parse_detail)

        # 处理下一页URL，直接获取下一页的href链接
        next_page = response.css(
            "div.co_content8 div.x a:contains('下一页')::attr(href)"
        ).get()
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
        zoom_content = response.xpath(
            '//div[@id="Zoom"]/text() | //div[@id="Zoom"]/p/text() | //div[@id="Zoom"]/br/following-sibling::text()'
        ).getall()
        zoom_text = "".join(zoom_content)
        # 提取电影名称
        name_match = re.search(r"◎片\s*名\s*([^\n◎]+)", zoom_text)
        if not name_match:
            return
        movie_item["name"] = name_match.group(1).strip()
        # 提取电影下载链接（磁力链接）
        download_url = response.css("div#downlist a[href^='magnet']::attr(href)").get()
        if not is_downloadable(download_url):
            return
        movie_item["download_link"] = download_url
        movie_item["source"] = "电影天堂"
        # 提取电影封面
        movie_item["cover"] = response.css("div#Zoom img::attr(src)").get()
        # 提取电影评分
        score_match = re.search(r"◎豆瓣评分\s*(\d+\.\d+)/10", zoom_text)
        if score_match:
            movie_item["score"] = float(score_match.group(1))
        else:
            movie_item["score"] = 0.0
        # 提取电影地区
        area_match = re.search(r"◎产\s*地\s*([^\n◎]+)", zoom_text)
        movie_item["area"] = area_match.group(1).strip() if area_match else ""
        # 提取电影语言
        language_match = re.search(r"◎语\s*言\s*([^\n◎]+)", zoom_text)
        movie_item["language"] = (
            language_match.group(1).strip() if language_match else ""
        )
        # 提取电影类型并用逗号分隔
        category_match = re.search(r"◎类\s*别\s*([^\n◎]+)", zoom_text)
        if category_match:
            category = category_match.group(1).strip()
            # 将斜杠替换为逗号
            category = category.replace("/", ",")
            movie_item["category"] = category
        else:
            movie_item["category"] = ""
        # 提取电影上映日期
        release_date_match = re.search(r"◎上映日期\s*([^\n◎]+)", zoom_text)
        movie_item["release_date"] = (
            release_date_match.group(1).strip() if release_date_match else ""
        )
        # 提取电影片长
        duration_match = re.search(r"◎片\s*长\s*([^\n◎]+)", zoom_text)
        if duration_match:
            movie_item["duration"] = (
                duration_match.group(1).strip().replace("Mins", "分钟")
            )
        else:
            movie_item["duration"] = ""
        # 提取电影导演(多行)
        director_match = re.search(r"◎导\s*演\s*([^\n◎]+)", zoom_text)
        if director_match:
            directors = director_match.group(1).strip()
            movie_item["director"] = re.sub(r"\s+", ",", directors)
        else:
            movie_item["director"] = ""
        # 提取电影演员（多行）
        actors_match = re.search(r"◎主\s*演\s*([^\n◎]+)", zoom_text)
        if actors_match:
            actors = actors_match.group(1).strip()
            movie_item["actors"] = re.sub(r"\s+", ",", actors)
        else:
            movie_item["actors"] = ""
        # 提取电影简介
        summary_match = re.search(r"◎简\s*介\s*([^◎]+)", zoom_text)
        if summary_match:
            summary = summary_match.group(1).strip()
            movie_item["summary"] = re.sub(r"\s", "", summary)
        else:
            movie_item["summary"] = ""

        yield movie_item

    def closed(self, reason):
        sync_db("movie.db")
        print(f"Spider {self.name} closed with reason: {reason}")
