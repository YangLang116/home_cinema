from itemadapter import ItemAdapter
import sqlite3


class SaveDBPipeline:
    def open_spider(self, spider):
        # 连接到 SQLite 数据库
        self.conn = sqlite3.connect(f'{spider.name}.db')
        self.cursor = self.conn.cursor()
        # 创建一个名为 media 的表
        self.cursor.execute('''
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
        ''')
        self.conn.commit()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        # 检查数据库中是否已存在具有相同 name 和 release_date 的记录
        self.cursor.execute('''
            SELECT id FROM media WHERE name =? AND release_date =?
        ''', (adapter.get('name'), adapter.get('release_date')))
        existing_record = self.cursor.fetchone()
        if existing_record:
            # 如果存在，则更新记录
            self._update_movie(adapter, existing_record[0])
        else:
            # 如果不存在，则插入新记录
            self._insert_movie(adapter)

        self.conn.commit()
        return item

    def _insert_movie(self, adapter):
        self.cursor.execute('''
            INSERT INTO media (cover, name, score, area, language, category, release_date, duration, director, actors, summary, download_link)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            adapter.get('cover'),
            adapter.get('name'),
            adapter.get('score'),
            adapter.get('area'),
            adapter.get('language'),
            adapter.get('category'),
            adapter.get('release_date'),
            adapter.get('duration'),
            adapter.get('director'),
            adapter.get('actors'),
            adapter.get('summary'),
            adapter.get('download_link')
        ))

    def _update_movie(self, adapter, movie_id):
        self.cursor.execute('''
            UPDATE media
            SET cover =?, score =?, area =?, language =?, category =?, duration =?, director =?, actors =?, summary =?, download_link =?
            WHERE id =?
        ''', (
            adapter.get('cover'),
            adapter.get('score'),
            adapter.get('area'),
            adapter.get('language'),
            adapter.get('category'),
            adapter.get('duration'),
            adapter.get('director'),
            adapter.get('actors'),
            adapter.get('summary'),
            adapter.get('download_link'),
            movie_id
        ))
        self.conn.commit()

    def close_spider(self, spider):
        # 关闭数据库连接
        self.conn.close()
