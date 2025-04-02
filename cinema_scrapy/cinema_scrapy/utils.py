import shutil
import os
from datetime import datetime


# 备份数据
def __backup_data__(db_name):
    project_dir = os.path.dirname(os.path.dirname(__file__))
    backup_dir = os.path.join(project_dir, "backup")
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    current_date = datetime.now().strftime("%Y%m%d")
    backup_name = f"{os.path.splitext(db_name)[0]}_{current_date}.db"
    backup_path = os.path.join(backup_dir, backup_name)
    shutil.copy2(os.path.join(project_dir, db_name), backup_path)

# 发送数据到服务器
def __send_data_to_server__(db_name):
    project_dir = os.path.dirname(os.path.dirname(__file__))
    server_dir = os.path.join(os.path.dirname(project_dir), "cinema_server")
    target_path = os.path.join(server_dir, db_name)
    shutil.copy2(os.path.join(project_dir, db_name), target_path)

def sync_db(db_name):
    __backup_data__(db_name)
    __send_data_to_server__(db_name)

# 判断是否是可下载的链接
def is_downloadable(url):
    if url is None:
        return False
    return url.startswith("magnet:") or url.endswith("thunder://")
