# Docker 多阶段构建介绍

Docker 的多阶段构建(Multi-stage builds)是一种优化 Docker 镜像大小的技术，允许你在单个 Dockerfile 中使用多个`FROM`指令，每个`FROM`指令开始一个新的构建阶段。

## 基本概念

多阶段构建的主要目的是：

1. 分离构建环境和运行环境
2. 减小最终镜像的大小（只包含必要的运行时文件）
3. 简化构建流程（一个 Dockerfile 完成所有工作）

## 基本语法

```dockerfile
# 第一阶段：构建阶段
FROM [image] AS [stage-name]
# 构建命令...

# 第二阶段：运行阶段
FROM [runtime-image]
# 从之前的阶段复制文件
COPY --from=[stage-name] [source] [destination]
# 其他配置...
```

## 示例

### 简单示例

```dockerfile
# 第一阶段：构建
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp .

# 第二阶段：运行
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/myapp .
CMD ["./myapp"]
```

### 多阶段示例（多个构建阶段）

```dockerfile
# 第一阶段：构建依赖
FROM node:18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 第二阶段：构建应用
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 第三阶段：运行
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
CMD ["node", "dist/main.js"]
```

## 优势

1. **减小镜像大小**：最终镜像不包含构建工具和中间文件
2. **提高安全性**：减少攻击面，不包含编译器等不必要组件
3. **简化 CI/CD 流程**：单个 Dockerfile 完成构建和部署
4. **清晰的构建阶段分离**：不同阶段专注于不同任务

## 高级用法

1. **命名阶段**：使用`AS`给阶段命名，方便引用
2. **从特定阶段复制**：`COPY --from=stage-name`
3. **使用外部镜像作为源**：`COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf`
4. **构建时选择目标阶段**：`docker build --target builder -t myapp:builder .`

## 注意事项

1. 只有最后一个`FROM`阶段的镜像会被标记和保存
2. 可以使用`docker build --target`来停在特定阶段
3. 阶段间共享的文件系统是独立的，需要通过`COPY --from`显式复制

多阶段构建是现代 Docker 最佳实践的重要组成部分，特别适合需要编译或复杂构建过程的应用。

# Docker 构建镜像和运行容器的常用命令

## 1. 构建 Docker 镜像

基本构建命令：

```bash
docker build -t your-image-name:tag .
```

常用选项：

- `-t` 或 `--tag`: 为镜像指定名称和标签（格式：`name:tag`）
- `-f` 或 `--file`: 指定 Dockerfile 路径（非默认名称时使用）
- `--target`: 多阶段构建时指定目标阶段
- `--no-cache`: 不使用缓存构建

示例：

```bash
# 基本构建
docker build -t my-go-app:1.0 .

# 指定 Dockerfile 路径
docker build -t my-go-app -f dockerfiles/prod.Dockerfile .

# 多阶段构建指定阶段
docker build -t my-go-app:builder --target builder .
```

## 2. 运行 Docker 容器

基本运行命令：

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

常用选项：

- `-d`: 后台运行（detached 模式）
- `-p`: 端口映射（格式：`主机端口:容器端口`）
- `--name`: 为容器指定名称
- `-v`: 卷挂载（格式：`主机路径:容器路径`）
- `-e`: 设置环境变量
- `--rm`: 容器退出后自动删除
- `-it`: 交互模式运行（通常用于调试）

示例：

```bash
# 简单运行
docker run my-go-app:1.0

# 后台运行并映射端口
docker run -d -p 8080:8080 --name my-app my-go-app:1.0

# 带环境变量运行
docker run -e "ENV=production" -e "PORT=8080" my-go-app:1.0

# 挂载卷运行
docker run -v /host/path:/container/path my-go-app:1.0

# 交互模式运行（进入容器）
docker run -it --rm my-go-app:1.0 /bin/sh
```

## 3. 常用组合操作

### 构建并立即运行

```bash
docker build -t my-go-app . && docker run --rm my-go-app
```

### 构建并运行（带端口映射）

```bash
docker build -t my-go-app . && docker run -p 8080:8080 --rm my-go-app
```

### 开发时热重载（带卷挂载）

```bash
docker build -t my-go-app-dev . && \
docker run -p 8080:8080 -v $(pwd):/app --rm my-go-app-dev
```

## 4. 其他实用命令

查看镜像列表：

```bash
docker images
```

查看运行中的容器：

```bash
docker ps
```

查看所有容器（包括停止的）：

```bash
docker ps -a
```

停止容器：

```bash
docker stop 容器ID或名称
```

删除容器：

```bash
docker rm 容器ID或名称
```

删除镜像：

```bash
docker rmi 镜像ID或名称
```

进入运行中的容器：

```bash
docker exec -it 容器ID或名称 /bin/sh
```

## 5. 针对 Go 项目的特别建议

1. 使用多阶段构建减小镜像体积
2. 使用 `.dockerignore` 文件排除不必要的文件（如 IDE 配置、Git 文件等）
3. 开发时可以使用卷挂载实现代码热更新
4. 生产环境使用静态编译（`CGO_ENABLED=0`）

示例完整工作流：

```bash
# 构建生产镜像
docker build -t my-go-app:prod -f Dockerfile.prod .

# 运行生产容器
docker run -d -p 80:8080 --name my-prod-app my-go-app:prod

# 查看日志
docker logs -f my-prod-app
```
