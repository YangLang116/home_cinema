import sqlite3
import os

def check_database(db_path):
    """
    检查数据库中的记录数量和来源分布
    
    参数:
    db_path: 数据库文件路径
    """
    if not os.path.exists(db_path):
        print(f"数据库文件不存在: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 检查media表的总记录数
        cursor.execute("SELECT COUNT(*) FROM media")
        total_records = cursor.fetchone()[0]
        print(f"media表总记录数: {total_records}")
        
        # 检查各来源的记录数量
        cursor.execute("SELECT source, COUNT(*) FROM media GROUP BY source")
        source_distribution = cursor.fetchall()
        print("各来源的记录数量:")
        for source, count in source_distribution:
            print(f"  {source}: {count}条")
        
        # 检查可能的重复记录
        cursor.execute("""
            SELECT m1.name, m1.director, COUNT(*) as count
            FROM media m1
            GROUP BY m1.name, m1.director
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
        if duplicates:
            print(f"\n发现 {len(duplicates)} 组可能的重复记录:")
            for i, (name, director, count) in enumerate(duplicates[:10], 1):
                print(f"  {i}. {name} (导演: {director}) - {count}条记录")
                
                # 获取这组重复记录的详情
                cursor.execute("""
                    SELECT id, name, director, source
                    FROM media
                    WHERE name = ? AND director = ?
                """, (name, director))
                detail_records = cursor.fetchall()
                for record in detail_records:
                    print(f"     ID: {record[0]}, 来源: {record[3]}")
            
            if len(duplicates) > 10:
                print(f"  ... 还有 {len(duplicates) - 10} 组重复记录")
        else:
            print("\n未发现重复记录")
    
    except Exception as e:
        print(f"查询数据库时出错: {e}")
    
    finally:
        conn.close()

def main():
    # 数据库文件路径
    movie_db = "../movie.db"
    tvshow_db = "../tvshow.db"
    
    print("检查电影数据库...")
    check_database(movie_db)
    
    print("\n检查电视剧数据库...")
    check_database(tvshow_db)

if __name__ == "__main__":
    main() 