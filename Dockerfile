# 第一阶段：构建
FROM golang:1.24 AS builder

WORKDIR /app

# 先下载依赖（利用 Docker 缓存层）
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 构建应用（可根据需要添加构建标签）
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /myapp

# 第二阶段：运行
FROM alpine:latest

WORKDIR /root/

# 从构建阶段复制二进制文件
COPY --from=builder /myapp .
COPY ./public ./public

# 复制配置文件等（如有需要）
# COPY --from=builder /app/config.yaml .

# 设置启动命令
CMD ["./myapp"]