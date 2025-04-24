import sqlite3


def __connect_movie_db(db):
    return sqlite3.connect(db)


def __get_data_from_cursor(cursor):
    result = []
    data_list = cursor.fetchall()
    for data in data_list:
        info = {
            "id": data[0],
            "cover": data[1],
            "name": data[2],
            "score": data[3],
            "area": data[4],
            "language": data[5],
            "category": data[6],
            "release_date": data[7],
            "duration": data[8],
            "director": data[9],
            "actors": data[10],
            "summary": data[11],
            "download_link": data[12],
        }
        result.append(info)
    return result


def __get_data_from_db(db, sql, args):
    conn = None
    try:
        conn = __connect_movie_db(db)
        cursor = conn.cursor()
        cursor.execute(sql, args)
        result = __get_data_from_cursor(cursor)
        return result
    except sqlite3.Error as e:
        print(f"get data error: {str(e)}, SQL: {sql}, 参数: {args}")
        return []
    finally:
        if conn:
            conn.close()


def get_page_data(db, page, per_page, sort_by="time", sort_order="desc", area="", category=""):
    """
    获取分页数据，支持排序和按地区、分类筛选
    :param db: 数据库文件
    :param page: 页码
    :param per_page: 每页条数
    :param sort_by: 排序字段,可选值:time(发布时间)、score(评分)
    :param sort_order: 排序方向,可选值:asc(升序)、desc(降序)
    :param area: 地区筛选,为空时不筛选，支持模糊匹配
    :param category: 分类筛选,为空时不筛选，支持模糊匹配
    :return: 数据列表
    """
    offset = (page - 1) * per_page
    if sort_by not in ["time", "score"]:
        sort_by = "time"
    if sort_order not in ["asc", "desc"]:
        sort_order = "desc"
    order_column = "release_date" if sort_by == "time" else "score"
    order_direction = "DESC" if sort_order == "desc" else "ASC"
    
    # 构建查询条件
    conditions = []
    params = []
    
    if area:
        conditions.append("area LIKE ?")
        params.append(f"%{area}%")
    
    if category:
        conditions.append("category LIKE ?")
        params.append(f"%{category}%")
    
    if conditions:
        where_clause = " AND ".join(conditions)
        sql = f"SELECT * FROM media WHERE {where_clause} ORDER BY {order_column} {order_direction} LIMIT ? OFFSET ?"
        params.extend([per_page, offset])
        return __get_data_from_db(db, sql, tuple(params))
    else:
        sql = f"SELECT * FROM media ORDER BY {order_column} {order_direction} LIMIT ? OFFSET ?"
        return __get_data_from_db(db, sql, (per_page, offset))


def get_search_data(db, name):
    return __get_data_from_db(
        db, "SELECT * FROM media WHERE name LIKE ?", (f"%{name}%",)
    )


def get_all_areas(db):
    """
    获取数据库中所有的地区集合
    :param db: 数据库文件
    :return: 唯一地区列表
    """
    conn = None
    try:
        conn = __connect_movie_db(db)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT area FROM media WHERE area IS NOT NULL AND area != ''")
        
        # 处理复合地区，如"中国台湾, 新加坡"
        all_areas = []
        for row in cursor.fetchall():
            # 按", "分割复合地区
            if row[0] and ", " in row[0]:
                areas = row[0].split(", ")
                all_areas.extend(areas)
            else:
                all_areas.append(row[0])
        
        # 去重并排序
        unique_areas = sorted(list(set(all_areas)))
        return unique_areas
    except sqlite3.Error as e:
        print(f"get areas error: {str(e)}")
        return []
    finally:
        if conn:
            conn.close()


def get_all_categories(db):
    """
    获取数据库中所有的分类集合
    :param db: 数据库文件
    :return: 唯一分类列表
    """
    conn = None
    try:
        conn = __connect_movie_db(db)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT category FROM media WHERE category IS NOT NULL AND category != ''")
        
        # 处理复合分类，如"剧情, 动作"
        all_categories = []
        for row in cursor.fetchall():
            # 按", "分割复合分类
            if row[0] and ", " in row[0]:
                categories = row[0].split(", ")
                all_categories.extend(categories)
            else:
                all_categories.append(row[0])
        
        # 去重并排序
        unique_categories = sorted(list(set(all_categories)))
        return unique_categories
    except sqlite3.Error as e:
        print(f"get categories error: {str(e)}")
        return []
    finally:
        if conn:
            conn.close()
