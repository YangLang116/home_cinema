from flask import Flask
from flask_cors import CORS
from bp.bp_tvshow import bp_tvshow
from bp.bp_movie import bp_movie
from bp.bp_media import bp_media
from utils.db_connection import get_connection_pool, close_all_pools
import atexit
from config import movie_db, tvshow_db


def init_db_pools():
    """
    初始化数据库连接池
    """
    # 预热连接池
    get_connection_pool(movie_db, max_connections=10)
    get_connection_pool(tvshow_db, max_connections=10)
    # 注册应用关闭时的清理函数
    atexit.register(close_all_pools)


def create_app():
    """
    创建并配置Flask应用
    """
    _app = Flask(__name__)
    # 允许所有域名跨域访问
    CORS(_app, resources={r"/*": {"origins": "*"}})
    _app.register_blueprint(bp_tvshow)
    _app.register_blueprint(bp_movie)
    _app.register_blueprint(bp_media)
    # 初始化数据库连接池
    init_db_pools()
    return _app


app = create_app()

if __name__ == "__main__":
    app.run(debug=False, port=7000)
