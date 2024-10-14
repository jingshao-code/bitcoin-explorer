FROM node:16

# 安装 sqlite3
RUN apt-get update && apt-get install -y sqlite3

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 并安装依赖
COPY package.json ./
RUN npm install

# 复制所有代码和数据库文件
COPY . .

# 开放端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
