# 命令

以下是 **Nginx 最常见、实用的命令合集**，适用于本地开发、服务器部署、调试配置等场景：

---

## 🛠️ 基本操作命令

| 命令              | 说明                               |
| ----------------- | ---------------------------------- |
| `nginx`           | 启动 Nginx（默认使用配置文件）     |
| `nginx -s stop`   | 立刻停止 Nginx                     |
| `nginx -s quit`   | 平滑停止（处理完当前连接）         |
| `nginx -s reload` | 平滑重载配置（常用于修改配置后）   |
| `nginx -s reopen` | 重新打开日志文件（用于日志切割后） |

---

## 🔍 配置测试相关

| 命令                              | 说明                                            |
| --------------------------------- | ----------------------------------------------- |
| `nginx -t`                        | 测试配置文件是否正确                            |
| `nginx -T`                        | 打印完整配置（包含所有 `include` 的文件）并测试 |
| `nginx -t -c /path/to/nginx.conf` | 指定配置文件进行语法测试                        |

---

## 🗂️ 自定义配置文件

| 命令                           | 说明                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `nginx -c /path/to/nginx.conf` | 启动时指定自定义配置文件                                             |
| `nginx -p /your/path/`         | 设置运行目录（`conf/nginx.conf`, `logs/`, `html/` 等会从此路径开始） |

---

## 🔄 查看运行状态（类 Unix 系统）

| 命令                       | 说明                                          |                         |
| -------------------------- | --------------------------------------------- | ----------------------- |
| \`ps aux                   | grep nginx\`                                  | 查看 Nginx 是否正在运行 |
| `sudo lsof -i :80`         | 查看是否有服务占用 80 端口（或其他端口）      |                         |
| `curl -I http://localhost` | 检查响应头是否正常（快速验证 Nginx 是否工作） |                         |

---

## 📁 路径说明（默认路径，按 Homebrew 示例）

| 类型           | 路径（示例）                         |
| -------------- | ------------------------------------ |
| 配置文件       | `/opt/homebrew/etc/nginx/nginx.conf` |
| 静态文件根目录 | `/opt/homebrew/var/www/`             |
| 日志文件       | `/opt/homebrew/var/log/nginx/`       |
| PID 文件       | `/opt/homebrew/var/run/nginx.pid`    |

---

## 📌 常见问题处理命令

### 🔄 强制重新加载配置（不重启服务）

```bash
sudo nginx -t && sudo nginx -s reload
```

### 🛑 杀死所有 Nginx 进程（不推荐常用）

```bash
sudo pkill nginx
```

---

## ✅ 小贴士

- 所有涉及到端口（如 80、443）或系统目录（如 `/var/run`）的操作，一般都需要加 `sudo`。
- 如果你是用 Homebrew 安装的 Nginx，可用以下命令管理服务：

```bash
brew services start nginx
brew services stop nginx
brew services restart nginx
```

---
