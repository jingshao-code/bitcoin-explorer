import sqlite3
import os

# 确保数据库文件创建在具有读写权限的目录
db_path = os.path.expanduser('~/Documents/BitcoinExplorer/blockchain_data.db')

# 连接或创建数据库
connection = sqlite3.connect(db_path)

# 创建游标对象
cursor = connection.cursor()

# 创建一个表格，用于存储区块高度
cursor.execute('''
    CREATE TABLE IF NOT EXISTS block_height (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        height INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
''')

# 提交并关闭连接
connection.commit()
connection.close()

print("Database and table created successfully at:", db_path)
