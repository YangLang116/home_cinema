import json
from flask import Blueprint, request, jsonify, make_response
from utils.tools import get_page_data, get_search_data, get_all_areas, get_all_categories

__db__ = "tvshow.db"

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
    data_list = get_page_data(__db__, page, per_page, sort_by, sort_order, area, category)
    return __format_data__(data_list)


# 根据名称查询电视剧信息
@bp_tvshow.route("/search", methods=["GET"])
def search_tvshows():
    name = request.args.get("name")
    data_list = get_search_data(__db__, name)
    return __format_data__(data_list)


# 获取所有电视剧地区
@bp_tvshow.route("/areas", methods=["GET"])
def get_tvshow_areas():
    areas = get_all_areas(__db__)
    response = make_response(jsonify({"data": areas}))
    response.headers["Content-Type"] = "application/json"
    return response


# 获取所有电视剧分类
@bp_tvshow.route("/categories", methods=["GET"])
def get_tvshow_categories():
    categories = get_all_categories(__db__)
    response = make_response(jsonify({"data": categories}))
    response.headers["Content-Type"] = "application/json"
    return response


def __format_data__(data_list):
    for data in data_list:
        download_json = data["download_link"]
        data["download_link"] = json.loads(download_json)
    response = make_response(jsonify(data_list))
    response.headers["Content-Type"] = "application/json"
    return response
