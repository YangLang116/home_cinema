import scrapy
import re
from cinema_scrapy.items import MediaItem
from cinema_scrapy.utils import (
    sync_db,
    regex_array,
    regex_string,
    regex_score,
    xpath_array,
    css_string,
    css_array,
)


class DyttTvshowSpider(scrapy.Spider):
    name = "dytt_tvshow"
    allowed_domains = ["dytt8899.com"]
    start_urls = [
        "https://www.dytt8899.com/html/tv/hytv/index.html",  # 华语
        "https://www.dytt8899.com/html/tv/oumeitv/index.html",  # 欧美
        "https://www.dytt8899.com/html/tv/rihantv/index.html",  # 日韩
    ]
    visited_urls = set()

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        # 处理详情页URL
        detail_urls = css_array(
            response, "table.tbspan td b a.ulink[href^='/i/']::attr(href)"
        )
        for detail_url in detail_urls:
            absolute_detail_url = response.urljoin(detail_url)
            self.logger.info(f"Visited TV Detail Url: {absolute_detail_url}")
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
                self.logger.info(f"Visited TV List Url: {absolute_next_page_url}")
                yield scrapy.Request(url=absolute_next_page_url, callback=self.parse)

    def parse_detail(self, response):
        tv_item = MediaItem()
        # 获取Zoom区域的内容
        zoom_content = xpath_array(
            response,
            '//div[@id="Zoom"]/text() | //div[@id="Zoom"]/p/text() | //div[@id="Zoom"]/br/following-sibling::text()',
        )
        zoom_text = "".join(zoom_content)
        # 提取电视剧名称
        name = regex_string(zoom_text, r"◎片\s*名\s*([^\n◎]+)")
        if not name:
            return
        tv_item["name"] = name
        # 提取电视剧下载链接（磁力链接）
        download_links = []
        for item in response.css("div#downlist a[href^='magnet']"):
            download_url = item.css("a[href^='magnet']::attr(href)").get()
            name = re.search(r"&dn=([^.&]+)", download_url).group(1)
            download_links.append({"name": name, "link": download_url})
        if not download_links:
            return
        tv_item["download_link"] = download_links
        tv_item["source"] = "电影天堂"
        # 提取电视剧封面
        tv_item["cover"] = css_string(response, "div#Zoom img::attr(src)")
        # 提取电视剧评分
        tv_item["score"] = regex_score(zoom_text, r"◎豆瓣评分\s*(\d+\.\d+)/10")
        # 提取电视剧地区
        tv_item["area"] = regex_array(zoom_text, r"◎产\s*地\s*([^\n◎]+)")
        # 提取电视剧语言
        tv_item["language"] = regex_array(zoom_text, r"◎语\s*言\s*([^\n◎]+)")
        # 提取电视剧类型并用逗号分隔
        tv_item["category"] = regex_array(zoom_text, r"◎类\s*别\s*([^\n◎]+)")
        # 提取电视剧上映日期
        tv_item["release_date"] = regex_string(zoom_text, r"◎上映日期\s*([^\n◎]+)")
        # 提取电视剧片长
        tv_item["duration"] = regex_string(zoom_text, r"◎片\s*长\s*([^\n◎]+)").replace(
            " Mins", "分钟"
        )
        # 提取电视剧导演(多行)
        tv_item["director"] = re.sub(
            r"\s+", ",", regex_string(zoom_text, r"◎导\s*演\s*([^\n◎]+)")
        )
        # 提取电视剧演员（多行）
        tv_item["actors"] = re.sub(
            r"\s+", ",", regex_string(zoom_text, r"◎主\s*演\s*([^\n◎]+)")
        )
        # 提取电视剧简介
        tv_item["summary"] = re.sub(
            r"\s", "", regex_string(zoom_text, r"◎简\s*介\s*([^◎]+)")
        )
        yield tv_item

    def closed(self, reason):
        sync_db("tvshow.db")
        print(f"Spider {self.name} closed with reason: {reason}")
