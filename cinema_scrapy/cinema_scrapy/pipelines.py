from itemadapter import ItemAdapter
import sqlite3
import json


class SaveDBPipeline:
    def open_spider(self, spider):
        # 连接到 SQLite 数据库
        spider_name = spider.name.split("_")[1]
        self.conn = sqlite3.connect(f"../{spider_name}.db")
        self.cursor = self.conn.cursor()
        # 创建一个名为 media 的表
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cover TEXT,
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
            """SELECT id, cover, score, download_link FROM media WHERE name =? AND director =?""",
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
            )
        else:
            # 如果不存在，则插入新记录
            self._insert_media(adapter)

        self.conn.commit()
        return item

    def _insert_media(self, adapter):
        self.cursor.execute(
            """
            INSERT INTO media (cover, name, score, area, language, category, release_date, duration, director, actors, summary, download_link)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """,
            (
                adapter.get("cover"),
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
        # 添加更多下载链接
        origin_download_link = json.loads(origin_download_link)
        origin_download_link[adapter.get("source")] = adapter.get("download_link")
        download_link = json.dumps(origin_download_link, ensure_ascii=False)
        self.cursor.execute(
            """
            UPDATE media
            SET cover =?, score =?, download_link =?
            WHERE id =?
        """,
            (cover, score, download_link, movie_id),
        )
        self.conn.commit()

    def close_spider(self, spider):
        # 关闭数据库连接
        self.conn.close()
