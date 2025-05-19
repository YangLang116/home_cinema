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


class Xunlei8TvshowSpider(scrapy.Spider):
    name = "xunlei8_tvshow"
    allowed_domains = ["xunlei8.cc"]
    start_urls = [
        f"https://xunlei8.cc/tv-0-0-0-date-{page}-30.html" for page in range(1, 100)
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
            self.logger.info(f"Visited TV Detail Url: {absolute_detail_url}")
            yield scrapy.Request(url=absolute_detail_url, callback=self.parse_detail)

        # 处理下一页URL
        next_page_url = css_string(response, ".pagination>li:last-child>a::attr(href)")
        if next_page_url:
            absolute_next_page_url = response.urljoin(next_page_url)
            # 检查URL是否已经访问过
            if absolute_next_page_url not in self.visited_urls:
                self.visited_urls.add(absolute_next_page_url)
                self.logger.info(f"Visited TV List Url: {absolute_next_page_url}")
                yield scrapy.Request(url=absolute_next_page_url, callback=self.parse)

    def parse_detail(self, response):
        tv_item = MediaItem()
        # 提取电视剧名称
        tv_name = css_string(response, ".b586afc9 h1::text")
        if tv_name is None:
            return
        tv_item["name"] = tv_name
        # 提取下载链接信息并处理为所需格式
        download_links = []
        for item in response.css(".bf8243b9 li"):
            name = css_string(item, "a.baf6e960dd::attr(title)")
            # 按“  ”分割，取第一段作为name内容
            if name:
                name = name.split("  ")[0]
            download_url = css_string(item, "label.copylabel a.copylink::attr(alt)")
            if name and is_downloadable(download_url):
                download_links.append({"name": name, "link": download_url})
        if not download_links:
            return
        tv_item["download_link"] = download_links
        tv_item["source"] = "迅雷电影天堂"
        # 提取电视剧封面
        tv_item["cover"] = css_string(response, ".ba330 img::attr(src)")
        # 提取电视剧评分
        score_text = css_string(response, ".b1cd81aa6c19b>span::text")
        match = re.search(r"(\d+(?:\.\d+)?)", score_text)
        tv_item["score"] = float(match.group(1)) if match else 0.0
        # 提取电视剧地区
        tv_item["area"] = join_array(
            css_array(response, 'p:contains("地区：") a::text')
        )
        # 提取电视剧语言
        tv_item["language"] = join_array(
            css_string(response, 'p:contains("语言：") a::text').split("/")
        )
        # 提取电视剧类型
        tv_item["category"] = join_array(
            css_array(response, 'p:contains("类型：") a::text')
        )
        # 提取电视剧上映日期
        tv_item["release_date"] = css_string(
            response, 'p:contains("上映：") .b06d85d1bf6::text'
        )
        # 提取电视剧片长
        tv_item["duration"] = css_string(
            response, 'p:contains("片长：") .b06d85d1bf6::text'
        )
        # 提取电视剧导演
        tv_item["director"] = join_array(
            css_array(response, 'p:contains("导演：") a::text')
        )
        # 提取电视剧主演
        tv_item["actors"] = join_array(
            css_array(response, 'p.b86e6c:contains("主演：") a::text')
        )
        # 提取电视剧剧情简介
        summary = css_string(response, 'h2.b5f5b3:contains("剧情简介") + p::text')
        tv_item["summary"] = re.sub(r"\s", "", summary) if summary else ""

        yield tv_item

    def closed(self, reason):
        sync_db("tvshow.db")
        print(f"Spider {self.name} closed with reason: {reason}")
