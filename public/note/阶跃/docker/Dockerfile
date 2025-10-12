FROM --platform=linux/amd64 neo-data-cn-shanghai.cr.volces.com/common/nginx-node-20:v2.0 as builder

WORKDIR /app

# RUN npm config set registry https://artifactory.stepfun-inc.com/artifactory/api/npm/aliyun-mirror-npm
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install -g pnpm@10.13.1

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# 构建
RUN pnpm build


FROM --platform=linux/amd64 neo-data-cn-shanghai.cr.volces.com/common/nginx-node-20:v2.0

WORKDIR /app

# ENV TZ=Asia/Shanghai
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 只复制构建产物
RUN mkdir -p /usr/share/nginx/html/
COPY --from=builder /app/dist /usr/share/nginx/html/
