import json
from flask import Blueprint, request, jsonify, make_response
from utils.tools import get_page_data, get_search_data, get_all_areas, get_all_categories, get_detail_by_id

__db__ = "movie.db"

bp_movie = Blueprint("movie", __name__, url_prefix="/movie")


# 分页获取电影列表
@bp_movie.route("/list", methods=["GET"])
def get_movies():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("count", 10))
    sort_by = request.args.get("sort_by", "time")
    sort_order = request.args.get("sort_order", "desc") 
    area = request.args.get("area", "")
    category = request.args.get("category", "")
    data_list = get_page_data(__db__, page, per_page, sort_by, sort_order, area, category)
    return __format_data__(data_list)


# 根据名称查询电影信息
@bp_movie.route("/search", methods=["GET"])
def search_movies():
    name = request.args.get("name")
    data_list = get_search_data(__db__, name)
    return __format_data__(data_list)


# 获取所有电影地区
@bp_movie.route("/areas", methods=["GET"])
def get_movie_areas():
    areas = get_all_areas(__db__)
    response = make_response(jsonify({"data": areas}))
    response.headers["Content-Type"] = "application/json"
    return response


# 获取所有电影分类
@bp_movie.route("/categories", methods=["GET"])
def get_movie_categories():
    categories = get_all_categories(__db__)
    response = make_response(jsonify({"data": categories}))
    response.headers["Content-Type"] = "application/json"
    return response


# 根据ID获取电影详情
@bp_movie.route("/detail", methods=["GET"])
def get_movie_detail():
    id = request.args.get("id")
    if not id:
        response = make_response(jsonify({"error": "缺少ID参数"}), 400)
        response.headers["Content-Type"] = "application/json"
        return response
    
    data = get_detail_by_id(__db__, id)
    if not data:
        response = make_response(jsonify({"error": "未找到对应的电影"}), 404)
        response.headers["Content-Type"] = "application/json"
        return response
    
    response = make_response(jsonify(data))
    response.headers["Content-Type"] = "application/json"
    return response


def __format_data__(data_list):
    response = make_response(jsonify(data_list))
    response.headers["Content-Type"] = "application/json"
    return response
