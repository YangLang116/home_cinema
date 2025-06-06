from itemadapter import ItemAdapter
import sqlite3
import json
import hashlib
import os
import requests
from urllib.parse import urlparse


class SaveDBPipeline:
    def open_spider(self, spider):
        # 连接到 SQLite 数据库
        type_name = spider.name.split("_")[1]
        self.conn = sqlite3.connect(f"{type_name}.db")
        self.cursor = self.conn.cursor()
        # 创建一个名为 media 的表
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cover TEXT,
                local_cover TEXT,
                name TEXT,
                score REAL,
                area TEXT,
                language TEXT,
                category TEXT,
                release_date TEXT,
                duration TEXT,
                director TEXT,
                actors TEXT,
                summary TEXT,
                download_link TEXT
            )
        """
        )
        self.conn.commit()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        # 检查数据库中是否已存在具有相同 name 和 release_date 的记录
        self.cursor.execute(
            """SELECT id, cover, local_cover, score, download_link FROM media WHERE name =? AND director =?""",
            (adapter.get("name"), adapter.get("director")),
        )
        existing_record = self.cursor.fetchone()
        if existing_record:
            # 如果存在，则更新记录
            self._update_media(
                adapter,
                existing_record[0],
                existing_record[1],
                existing_record[2],
                existing_record[3],
                existing_record[4],
            )
        else:
            # 如果不存在，则插入新记录
            self._insert_media(adapter)

        self.conn.commit()
        return item

    def _insert_media(self, adapter):
        self.cursor.execute(
            """
            INSERT INTO media (cover, local_cover, name, score, area, language, category, release_date, duration, director, actors, summary, download_link)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """,
            (
                adapter.get("cover"),
                adapter.get("local_cover"),
                adapter.get("name"),
                adapter.get("score"),
                adapter.get("area"),
                adapter.get("language"),
                adapter.get("category"),
                adapter.get("release_date"),
                adapter.get("duration"),
                adapter.get("director"),
                adapter.get("actors"),
                adapter.get("summary"),
                json.dumps(
                    {adapter.get("source"): adapter.get("download_link")},
                    ensure_ascii=False,
                ),
            ),
        )

    def _update_media(
        self,
        adapter,
        movie_id,
        origin_cover,
        origin_local_cover,
        origin_score,
        origin_download_link,
    ):
        # 更新评分
        score = adapter.get("score") if origin_score <= 0 else origin_score
        # 更新封面
        cover = (
            origin_cover
            if origin_cover is not None and "cdn" in origin_cover
            else adapter.get("cover")
        )
        # 更新本地封面
        local_cover = origin_local_cover or adapter.get("local_cover")
        # 添加更多下载链接
        origin_download_link = json.loads(origin_download_link)
        origin_download_link[adapter.get("source")] = adapter.get("download_link")
        download_link = json.dumps(origin_download_link, ensure_ascii=False)
        self.cursor.execute(
            """
            UPDATE media
            SET cover =?, local_cover =?, score =?, download_link =?
            WHERE id =?
        """,
            (cover, local_cover, score, download_link, movie_id),
        )
        self.conn.commit()

    def close_spider(self, spider):
        # 关闭数据库连接
        self.conn.close()


class DownloadCoverImagePipeline:

    def __init__(self):
        self.images_dir = "./images"
        if not os.path.exists(self.images_dir):
            os.makedirs(self.images_dir)

    def _get_filename(self, url):
        url_md5 = hashlib.md5(url.encode()).hexdigest()
        parsed_url = urlparse(url)
        path = parsed_url.path
        ext = os.path.splitext(path)[1]
        if not ext:
            ext = ".jpg"
        return f"{url_md5}{ext}"

    def _download_image(self, spider, url, file_path):
        try:
            response = requests.get(
                url,
                headers={"Referer": f"https://{spider.allowed_domains[0]}"},
                timeout=10,
            )
            if response.status_code == 200:
                with open(file_path, "wb") as f:
                    f.write(response.content)
                return True
            else:
                return False
        except Exception as e:
            return False

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        cover_url = adapter.get("cover")
        if cover_url and isinstance(cover_url, str):
            filename = self._get_filename(cover_url)
            file_path = os.path.join(self.images_dir, filename)
            if not os.path.exists(file_path):
                download_success = self._download_image(spider, cover_url, file_path)
                if download_success:
                    adapter["local_cover"] = filename
                    spider.logger.info(f"下载封面图片成功: {cover_url} -> {filename}")
                else:
                    spider.logger.error(f"下载封面图片失败: {cover_url}")
            else:
                adapter["local_cover"] = filename
                spider.logger.info(f"封面图片已存在: {filename}")
        else:
            spider.logger.info(f"封面图片不存在: {cover_url}")
        return item
