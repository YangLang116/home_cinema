import scrapy
import re
import json

from cinema_scrapy.items import MediaItem
from cinema_scrapy.utils import is_downloadable, sync_db


class TvshowSpider(scrapy.Spider):
    name = "tvshow"
    allowed_domains = ["xunlei8.cc"]
    start_urls = ["https://xunlei8.cc/tv.html"]
    visited_urls = set()

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        # 处理详情页URL
        detail_urls = response.css(".bc3ba>.b33c0>.b30de590050ee::attr(href)").getall()
        for detail_url in detail_urls:
            absolute_detail_url = response.urljoin(detail_url)
            self.logger.info(f"Visited TV Detail Url: {absolute_detail_url}")
            yield scrapy.Request(url=absolute_detail_url, callback=self.parse_detail)

        # 处理下一页URL
        next_page_url = response.css(".pagination>li:last-child>a::attr(href)").get()
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
        tv_name = response.css(".b586afc9 h1::text").get()
        if tv_name is None:
            return
        tv_item["name"] = tv_name
        # 提取下载链接信息并处理为所需格式
        download_links = []
        for item in response.css(".bf8243b9 li"):
            name = item.css("a.baf6e960dd::attr(title)").get()
            # 按“  ”分割，取第一段作为name内容
            if name:
                name = name.split("  ")[0]
            download_url = item.css("label.copylabel a.copylink::attr(alt)").get()
            if name and is_downloadable(download_url):
                download_links.append({"name": name, "link": download_url})
        if not download_links:
            return
        tv_item["download_link"] = json.dumps(download_links, ensure_ascii=False)

        # 提取电视剧封面
        tv_item["cover"] = response.css(".ba330 img::attr(src)").get()
        # 提取电视剧评分
        score_text = response.css(".b1cd81aa6c19b>span::text").get()
        match = re.search(r"(\d+(?:\.\d+)?)", score_text)
        tv_item["score"] = float(match.group(1)) if match else 0.0
        # 提取电视剧地区
        tv_item["area"] = ", ".join(
            response.css('p:contains("地区：") a::text').getall()
        )
        # 提取电视剧语言
        tv_item["language"] = response.css('p:contains("语言：") a::text').get()
        # 提取电视剧类型
        tv_item["category"] = response.css('p:contains("类型：") a::text').get()
        # 提取电视剧上映日期
        tv_item["release_date"] = response.css(
            'p:contains("上映：") .b06d85d1bf6::text'
        ).get()
        # 提取电视剧片长
        tv_item["duration"] = response.css(
            'p:contains("片长：") .b06d85d1bf6::text'
        ).get()
        # 提取电视剧导演
        tv_item["director"] = response.css('p:contains("导演：") a::text').get()
        # 提取电视剧主演
        tv_item["actors"] = ", ".join(
            response.css('p.b86e6c:contains("主演：") a::text').getall()
        )
        # 提取电视剧剧情简介
        tv_item["summary"] = response.css(
            'h2.b5f5b3:contains("剧情简介") + p::text'
        ).get()

        yield tv_item

    def closed(self, reason):
        sync_db("tvshow.db")
