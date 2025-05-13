import sqlite3
import os

def deduplicate_database(db_path, source_to_remove="电影天堂"):
    """
    对数据库进行去重操作
    对于name和director相同的记录，删除source=source_to_remove的记录
    
    参数:
    db_path: 数据库文件路径
    source_to_remove: 要删除的数据源，默认为"电影天堂"
    
    返回:
    deleted_items: 被删除的记录列表
    """
    if not os.path.exists(db_path):
        print(f"数据库文件不存在: {db_path}")
        return []
    
    conn = sqlite3.connect(db_path)
    # 启用外键约束
    conn.execute("PRAGMA foreign_keys = ON")
    # 开始事务
    conn.execute("BEGIN TRANSACTION")
    
    try:
        cursor = conn.cursor()
        
        # 查找所有name和director相同，且其中一条source为source_to_remove的记录
        cursor.execute("""
            SELECT m1.id, m1.name, m1.director, m1.source 
            FROM media m1
            INNER JOIN media m2 ON m1.name = m2.name AND m1.director = m2.director
            WHERE m1.id != m2.id AND m1.source = ?
        """, (source_to_remove,))
        
        duplicate_records = cursor.fetchall()
        deleted_items = []
        
        # 删除符合条件的记录
        for record in duplicate_records:
            record_id, name, director, source = record
            cursor.execute("DELETE FROM media WHERE id = ?", (record_id,))
            deleted_items.append({
                "id": record_id,
                "name": name,
                "director": director,
                "source": source
            })
        
        # 提交事务
        conn.commit()
        print(f"从 {db_path} 中删除了 {len(deleted_items)} 条重复记录")
        return deleted_items
    
    except Exception as e:
        # 出错时回滚
        conn.rollback()
        print(f"处理数据库 {db_path} 时出错: {e}")
        return []
    
    finally:
        conn.close()

def main():
    # 数据库文件路径
    movie_db = "../movie.db"
    tvshow_db = "../tvshow.db"
    
    print("开始处理电影数据库去重...")
    movie_deleted = deduplicate_database(movie_db)
    
    print("\n开始处理电视剧数据库去重...")
    tvshow_deleted = deduplicate_database(tvshow_db)
    # 将被删除的记录写入日志文件
    total_deleted = len(movie_deleted) + len(tvshow_deleted)
    try:
        with open("dedup_movies_log.txt", "w", encoding="utf-8") as f:
            f.write(f"去重操作日志 - 总共删除了 {total_deleted} 条重复记录\n\n")
            
            f.write(f"被删除的电影记录 ({len(movie_deleted)} 条):\n")
            for i, item in enumerate(movie_deleted, 1):
                f.write(f"{i}. ID: {item['id']}, 名称: {item['name']}, 导演: {item['director']}, 来源: {item['source']}\n")
            
            f.write(f"\n被删除的电视剧记录 ({len(tvshow_deleted)} 条):\n")
            for i, item in enumerate(tvshow_deleted, 1):
                f.write(f"{i}. ID: {item['id']}, 名称: {item['name']}, 导演: {item['director']}, 来源: {item['source']}\n")
        
        print(f"\n删除的记录详情已保存到 dedup_movies_log.txt 文件中")
    except Exception as e:
        print(f"写入日志文件时出错: {e}")

if __name__ == "__main__":
    main() 