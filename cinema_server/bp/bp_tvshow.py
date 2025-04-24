import json
from flask import Blueprint, request, jsonify, make_response
from utils.tools import get_page_data, get_search_data

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
    data_list = get_page_data(__db__, page, per_page, sort_by, sort_order, area)
    return __format_data__(data_list)


# 根据名称查询电视剧信息
@bp_tvshow.route("/search", methods=["GET"])
def search_tvshows():
    name = request.args.get("name")
    data_list = get_search_data(__db__, name)
    return __format_data__(data_list)


def __format_data__(data_list):
    for data in data_list:
        download_json = data["download_link"]
        data["download_link"] = json.loads(download_json)
    response = make_response(jsonify(data_list))
    response.headers["Content-Type"] = "application/json"
    return response
