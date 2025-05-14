from flask import Flask
from flask_cors import CORS
from bp.bp_tvshow import bp_tvshow
from bp.bp_movie import bp_movie
from bp.bp_media import bp_media
from utils.db_connection import get_connection_pool, close_all_pools
import atexit
import os


def init_db_pools():
    """
    初始化数据库连接池
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    movie_db = os.path.join(base_dir, "movie.db")
    tvshow_db = os.path.join(base_dir, "tvshow.db")
    # 预热连接池
    get_connection_pool(movie_db, max_connections=10)
    get_connection_pool(tvshow_db, max_connections=10)
    # 注册应用关闭时的清理函数
    atexit.register(close_all_pools)


if __name__ == "__main__":
    app = Flask(__name__)
    # 允许所有域名跨域访问
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.register_blueprint(bp_tvshow)
    app.register_blueprint(bp_movie)
    app.register_blueprint(bp_media)
    # 初始化数据库连接池
    init_db_pools()
    app.run(debug=False, port=7000)
