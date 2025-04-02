from flask import Blueprint, request, send_file
import requests
from io import BytesIO


bp_media = Blueprint("media", __name__, url_prefix="/media")


@bp_media.route("/proxy", methods=["GET"])
def proxy_image():
    image_url = request.args.get("url")
    if not image_url:
        return "Missing 'url' parameter", 400

    try:
        response = requests.get(image_url, headers={"Referer": "https://xunlei8.cc/"})
        response.raise_for_status()
        image_content = BytesIO(response.content)
        content_type = response.headers.get("Content-Type")
        resp = send_file(image_content, mimetype=content_type)
        resp.headers["Content-Type"] = content_type
        return resp
    except requests.RequestException as e:
        return f"Error fetching image: {str(e)}", 400