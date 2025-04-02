import json
from flask import Blueprint, request, jsonify, make_response
from utils.tools import get_page_data, get_search_data

__db__ = "movie.db"

bp_movie = Blueprint("movie", __name__, url_prefix="/movie")


# 分页获取电影列表
@bp_movie.route("/list", methods=["GET"])
def get_movies():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("count", 10))
    sort_by = request.args.get("sort_by", "time")
    sort_order = request.args.get("sort_order", "desc") 
    data_list = get_page_data(__db__, page, per_page, sort_by, sort_order)
    return __format_data__(data_list)


# 根据名称查询电影信息
@bp_movie.route("/search", methods=["GET"])
def search_movies():
    name = request.args.get("name")
    data_list = get_search_data(__db__, name)
    return __format_data__(data_list)


def __format_data__(data_list):
    response = make_response(jsonify(data_list))
    response.headers["Content-Type"] = "application/json"
    return response
