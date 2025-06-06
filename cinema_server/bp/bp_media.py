import os
from flask import Blueprint, send_file
from config import cover_dir


bp_media = Blueprint("media", __name__, url_prefix="/media")


@bp_media.route("/cover/<cover>", methods=["GET"])
def proxy_image(cover):
    try:
        file_path = os.path.join(cover_dir, cover)
        if not os.path.exists(file_path):
            return "File not found", 404
        return send_file(file_path)
    except Exception as e:
        return f"Error sending file: {str(e)}", 500
