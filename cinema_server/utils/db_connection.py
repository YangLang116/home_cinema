import sqlite3
import time
import threading
from collections import deque


class DatabaseConnectionPool:
    """
    SQLite数据库连接池
    """
    
    def __init__(self, db_path, max_connections=5, timeout=30):
        """
        初始化连接池
        :param db_path: 数据库文件路径
        :param max_connections: 最大连接数
        :param timeout: 获取连接的超时时间(秒)
        """
        self.db_path = db_path
        self.max_connections = max_connections
        self.timeout = timeout
        self.pool = deque()
        self.in_use = {}  # 正在使用的连接
        self.lock = threading.RLock()
        self.condition = threading.Condition(self.lock)
        
        # 初始化连接池
        for _ in range(max_connections):
            conn = sqlite3.connect(db_path, check_same_thread=False)
            self.pool.append(conn)
            
        print(f"数据库连接池初始化完成: {db_path}, 连接数: {max_connections}")
    
    def get_connection(self):
        """
        从连接池获取一个数据库连接
        """
        start_time = time.time()
        
        with self.condition:
            while len(self.pool) == 0:
                # 等待其他连接释放
                elapsed = time.time() - start_time
                if elapsed >= self.timeout:
                    raise TimeoutError("无法获取数据库连接，连接池已满且超时")
                
                # 计算剩余等待时间
                remaining = self.timeout - elapsed
                if remaining <= 0:
                    raise TimeoutError("无法获取数据库连接，连接池已满且超时")
                
                # 等待连接释放
                self.condition.wait(remaining)
            
            # 获取连接
            conn = self.pool.popleft()
            thread_id = threading.get_ident()
            self.in_use[thread_id] = conn
            
            return conn
    
    def release_connection(self, conn=None):
        """
        将连接归还到连接池
        """
        with self.condition:
            thread_id = threading.get_ident()
            
            # 如果没有指定连接，则使用当前线程正在使用的连接
            if conn is None:
                if thread_id in self.in_use:
                    conn = self.in_use.pop(thread_id)
                else:
                    return  # 没有可归还的连接
            
            # 将连接放回连接池
            self.pool.append(conn)
            
            # 通知等待中的线程
            self.condition.notify()
    
    def close_all(self):
        """
        关闭所有连接
        """
        with self.lock:
            # 关闭连接池中的连接
            while self.pool:
                conn = self.pool.popleft()
                try:
                    conn.close()
                except:
                    pass
            
            # 关闭正在使用的连接
            for thread_id, conn in list(self.in_use.items()):
                try:
                    conn.close()
                except:
                    pass
                self.in_use.pop(thread_id)


# 数据库连接池实例
_connection_pools = {}


def get_connection_pool(db_path, max_connections=5, timeout=30):
    """
    获取或创建数据库连接池
    """
    if db_path not in _connection_pools:
        _connection_pools[db_path] = DatabaseConnectionPool(db_path, max_connections, timeout)
    
    return _connection_pools[db_path]


def close_all_pools():
    """
    关闭所有连接池
    """
    for pool in _connection_pools.values():
        pool.close_all() 