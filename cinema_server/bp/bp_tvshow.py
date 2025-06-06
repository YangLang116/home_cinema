import json
from flask import Blueprint, request, jsonify, make_response
from utils.tools import get_page_data, get_search_data, get_all_areas, get_all_categories, get_detail_by_id
from config import tvshow_db

bp_tvshow = Blueprint("tvshow", __name__, url_prefix="/tvshow")


# 分页获取电视剧列表
@bp_tvshow.route("/list", methods=["GET"])
def get_tvshows():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("count", 10))
    sort_by = request.args.get("sort_by", "time")
    sort_order = request.args.get("sort_order", "desc")
    area = request.args.get("area", "")
    category = request.args.get("category", "")
    data_list = get_page_data(tvshow_db, page, per_page, sort_by, sort_order, area, category)
    return __format_data__(data_list)


# 根据名称查询电视剧信息
@bp_tvshow.route("/search", methods=["GET"])
def search_tvshows():
    name = request.args.get("name")
    data_list = get_search_data(tvshow_db, name)
    return __format_data__(data_list)


# 获取所有电视剧地区
@bp_tvshow.route("/areas", methods=["GET"])
def get_tvshow_areas():
    areas = get_all_areas(tvshow_db)
    response = make_response(jsonify({"data": areas}))
    response.headers["Content-Type"] = "application/json"
    return response


# 获取所有电视剧分类
@bp_tvshow.route("/categories", methods=["GET"])
def get_tvshow_categories():
    categories = get_all_categories(tvshow_db)
    response = make_response(jsonify({"data": categories}))
    response.headers["Content-Type"] = "application/json"
    return response


# 根据ID获取电视剧详情
@bp_tvshow.route("/detail", methods=["GET"])
def get_tvshow_detail():
    id = request.args.get("id")
    if not id:
        response = make_response(jsonify({"error": "缺少ID参数"}), 400)
        response.headers["Content-Type"] = "application/json"
        return response
    
    data = get_detail_by_id(tvshow_db, id)
    if not data:
        response = make_response(jsonify({"error": "未找到对应的电视剧"}), 404)
        response.headers["Content-Type"] = "application/json"
        return response
    
    # 转换下载链接为JSON对象
    download_json = data["download_link"]
    data["download_link"] = json.loads(download_json)
    
    response = make_response(jsonify(data))
    response.headers["Content-Type"] = "application/json"
    return response


def __format_data__(data_list):
    for data in data_list:
        download_json = data["download_link"]
        data["download_link"] = json.loads(download_json)
    response = make_response(jsonify(data_list))
    response.headers["Content-Type"] = "application/json"
    return response
