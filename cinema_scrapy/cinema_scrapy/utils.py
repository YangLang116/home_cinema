import shutil
import os
from datetime import datetime
import re


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
    print(f"备份文件已保存到: {backup_path}")


# 发送数据到服务器
def __send_data_to_server__(db_name):
    project_dir = os.path.dirname(os.path.dirname(__file__))
    server_dir = os.path.join(os.path.dirname(project_dir), "cinema_server")
    target_path = os.path.join(server_dir, db_name)
    shutil.copy2(os.path.join(project_dir, db_name), target_path)
    print(f"数据已发送至服务器: {target_path}")


def sync_db(db_name):
    __backup_data__(db_name)
    __send_data_to_server__(db_name)


# 判断是否是可下载的链接
def is_downloadable(url):
    if url is None:
        return False
    return url.startswith("magnet:") or url.startswith("thunder:")


# 拼接数组
def join_array(array):
    if array is None:
        return None
    return ",".join(set(item.strip() for item in array))


# 正则表达式提取数组
def regex_array(text, pattern, split="/"):
    match = re.search(pattern, text)
    if match:
        return join_array(match.group(1).strip().split(split))
    return ""


# 正则表达式提取字符串
def regex_string(text, pattern):
    match = re.search(pattern, text)
    if match:
        return match.group(1).strip()
    return ""


# 正则提取分数
def regex_score(text, pattern):
    match = re.search(pattern, text)
    if match:
        return float(match.group(1).strip())
    return 0.0


# css选择器提取字符串
def css_string(response, selector):
    return response.css(selector).get(default="").strip()


# css选择器提取数组
def css_array(response, selector):
    return [item.strip() for item in response.css(selector).getall()]


# xpath提取字符串
def xpath_string(response, xpath):
    return response.xpath(xpath).get(default="").strip()


# xpath提取数组
def xpath_array(response, xpath):
    return [item for item in response.xpath(xpath).getall()]
