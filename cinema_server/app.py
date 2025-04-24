from flask import Flask
from flask_cors import CORS
from bp.bp_tvshow import bp_tvshow
from bp.bp_movie import bp_movie
from bp.bp_media import bp_media

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # 允许所有域名跨域访问
app.register_blueprint(bp_tvshow)
app.register_blueprint(bp_movie)
app.register_blueprint(bp_media)

if __name__ == "__main__":
    app.run(host="192.168.182.35", debug=False, port=7000)
