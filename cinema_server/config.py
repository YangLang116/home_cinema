import os

_root_dir = os.path.dirname(os.path.dirname(__file__))
_scrapy_dir = os.path.join(_root_dir, 'cinema_scrapy')

cover_dir = os.path.join(_scrapy_dir, "images")
movie_db = os.path.join(_scrapy_dir, "movie.db")
tvshow_db = os.path.join(_scrapy_dir, "tvshow.db")