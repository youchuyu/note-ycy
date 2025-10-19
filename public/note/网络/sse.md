
# sse

好的，我来详细介绍 SSE（Server-Sent Events）的使用。SSE 是一种允许服务器向客户端主动推送数据的 Web 技术。

## 一、什么是 SSE？

SSE（Server-Sent Events）是一种基于 HTTP 的服务器向客户端推送数据的技术。与 WebSocket 不同，SSE 是**单向通信** - 只能从服务器向客户端发送数据。

### 与 WebSocket 的对比：

| 特性         | SSE                     | WebSocket             |
| ------------ | ----------------------- | --------------------- |
| 通信方向     | 服务器 → 客户端（单向） | 双向通信              |
| 协议         | HTTP                    | 独立的 WebSocket 协议 |
| 重连机制     | 内置自动重连            | 需要手动实现          |
| 数据传输     | 文本数据                | 文本和二进制数据      |
| 浏览器兼容性 | 良好                    | 优秀                  |

## 二、SSE 的核心特点

1. **单向通信**：服务器主动向客户端推送数据
2. **基于 HTTP**：使用标准 HTTP 协议，无需特殊服务器配置
3. **自动重连**：浏览器内置重连机制
4. **简单易用**：API 简单，实现成本低
5. **文本传输**：适合推送文本格式的数据

## 三、客户端使用

### 1. 创建 SSE 连接

```javascript
// 创建 EventSource 连接
const eventSource = new EventSource("/api/events");

// 或者带有配置选项（如果需要认证）
const eventSource = new EventSource("/api/events", {
  withCredentials: true, // 发送 cookies
});
```

### 2. 监听事件

```javascript
// 监听默认的 message 事件
eventSource.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  console.log("收到消息:", data);

  // 更新页面内容
  document.getElementById("messages").innerHTML += `<div>${
    data.message
  } - ${new Date(data.timestamp).toLocaleTimeString()}</div>`;
});

// 监听自定义事件
eventSource.addEventListener("notification", (event) => {
  const data = JSON.parse(event.data);
  console.log("通知:", data);

  // 显示通知
  showNotification(data.title, data.message);
});

// 监听连接打开事件
eventSource.addEventListener("open", (event) => {
  console.log("SSE 连接已建立");
  document.getElementById("status").textContent = "已连接";
});

// 监听错误事件
eventSource.addEventListener("error", (event) => {
  console.error("SSE 连接错误:", event);

  // 根据 eventSource.readyState 判断状态
  if (eventSource.readyState === EventSource.CLOSED) {
    document.getElementById("status").textContent = "连接已关闭";
  } else {
    document.getElementById("status").textContent = "连接错误，重连中...";
  }
});
```

### 3. 连接状态

```javascript
// 检查连接状态
console.log("连接状态:", eventSource.readyState);

// readyState 值：
// 0 - CONNECTING (连接中)
// 1 - OPEN (已打开)
// 2 - CLOSED (已关闭)

// 关闭连接
function closeConnection() {
  eventSource.close();
  console.log("SSE 连接已手动关闭");
}
```

## 四、服务端实现

### 1. Node.js + Express 示例

```javascript
const express = require("express");
const app = express();

// SSE 路由
app.get("/api/events", (req, res) => {
  // 设置 SSE 必需的响应头
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*", // 根据需求调整 CORS
  });

  console.log("客户端连接已建立");

  // 发送连接成功的消息
  sendEvent(res, "connected", {
    message: "连接成功",
    timestamp: Date.now(),
  });

  // 定时发送数据
  let counter = 0;
  const intervalId = setInterval(() => {
    counter++;

    // 发送普通消息
    sendEvent(res, "message", {
      id: counter,
      message: `这是第 ${counter} 条消息`,
      timestamp: Date.now(),
    });

    // 每5条消息发送一个通知
    if (counter % 5 === 0) {
      sendEvent(res, "notification", {
        title: "系统通知",
        message: `已发送 ${counter} 条消息`,
        type: "info",
        timestamp: Date.now(),
      });
    }

    // 测试 20 次后停止
    if (counter >= 20) {
      sendEvent(res, "complete", {
        message: "数据发送完成",
        timestamp: Date.now(),
      });
      clearInterval(intervalId);
      res.end(); // 结束连接
    }
  }, 2000); // 每2秒发送一次

  // 客户端断开连接时清理
  req.on("close", () => {
    console.log("客户端断开连接");
    clearInterval(intervalId);
    res.end();
  });

  req.on("error", (err) => {
    console.error("连接错误:", err);
    clearInterval(intervalId);
    res.end();
  });
});

// 发送事件的辅助函数
function sendEvent(res, event = "message", data) {
  const eventData = typeof data === "string" ? data : JSON.stringify(data);

  // SSE 数据格式
  res.write(`event: ${event}\n`); // 事件类型
  res.write(`data: ${eventData}\n`); // 数据内容
  res.write(`id: ${Date.now()}\n`); // 事件 ID（可选）
  res.write(`retry: 5000\n`); // 重连时间（毫秒，可选）
  res.write("\n"); // 空行表示事件结束
}

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
```

### 2. 更完整的服务端实现（支持多客户端）

```javascript
const express = require("express");
const app = express();

// 存储所有连接的客户端
const clients = new Set();

app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  console.log(`新的客户端连接，当前连接数: ${clients.size + 1}`);

  // 将当前响应对象存入客户端集合
  clients.add(res);

  // 发送欢迎消息
  sendToClient(res, "connected", {
    message: "欢迎连接 SSE 服务",
    clientCount: clients.size,
    timestamp: Date.now(),
  });

  // 广播新客户端加入（给所有客户端）
  broadcast(
    "user_joined",
    {
      message: `新用户加入，当前在线用户: ${clients.size}`,
      timestamp: Date.now(),
    },
    res
  ); // 排除当前客户端

  // 客户端断开连接时清理
  req.on("close", () => {
    console.log("客户端断开连接");
    clients.delete(res);

    // 广播用户离开
    broadcast("user_left", {
      message: `用户离开，当前在线用户: ${clients.size}`,
      timestamp: Date.now(),
    });

    res.end();
  });
});

// 向特定客户端发送消息
function sendToClient(res, event, data) {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n`);
    res.write("\n");
  } catch (error) {
    console.error("发送消息失败:", error);
  }
}

// 广播消息给所有客户端
function broadcast(event, data, excludeClient = null) {
  clients.forEach((client) => {
    if (client !== excludeClient) {
      sendToClient(client, event, data);
    }
  });
}

// 提供发送消息的 API 端点
app.post("/api/broadcast", express.json(), (req, res) => {
  const { message, type = "notification" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "消息内容不能为空" });
  }

  const broadcastData = {
    message,
    type,
    timestamp: Date.now(),
    from: "系统",
  };

  // 广播给所有客户端
  broadcast("broadcast", broadcastData);

  res.json({
    success: true,
    message: "广播发送成功",
    clientCount: clients.size,
  });
});

// 定时发送系统状态（可选）
setInterval(() => {
  const systemStatus = {
    clientCount: clients.size,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: Date.now(),
  };

  broadcast("system_status", systemStatus);
}, 30000); // 每30秒发送一次系统状态

app.listen(3000, () => {
  console.log("SSE 服务器运行在 http://localhost:3000");
});
```

## 五、SSE 数据格式

SSE 有严格的数据格式要求：

```text
event: message
data: 这是一条消息
id: 12345
retry: 5000

event: notification
data: {"title":"通知","content":"这是一条通知"}
id: 12346

```

- `event`: 事件类型（可选，默认是 `message`）
- `data`: 数据内容（可以是多行）
- `id`: 事件 ID（可选，用于重连时恢复）
- `retry`: 重连时间（毫秒，可选）
- 空行：表示一个事件结束

## 六、高级用法

### 1. 带认证的 SSE

```javascript
// 客户端 - 使用带有认证的 SSE
function createSSEWithAuth(token) {
  const eventSource = new EventSource(`/api/events?token=${token}`);
  return eventSource;
}

// 或者使用更安全的方式（在 Header 中传递）
async function createSecureSSE() {
  const response = await fetch("/api/sse-auth", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  // 服务端需要返回一个特殊的 SSE 端点
  if (response.ok) {
    const { sseUrl } = await response.json();
    return new EventSource(sseUrl);
  }
  throw new Error("认证失败");
}
```

### 2. 错误处理和重连

```javascript
class SSEManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;

    this.connect();
  }

  connect() {
    try {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        console.log("SSE 连接已建立");
        this.reconnectAttempts = 0;
        this.onOpen?.();
      };

      this.eventSource.onmessage = (event) => {
        this.onMessage?.(event);
      };

      this.eventSource.onerror = (event) => {
        console.error("SSE 连接错误");
        this.onError?.(event);

        if (this.eventSource.readyState === EventSource.CLOSED) {
          this.attemptReconnect();
        }
      };

      // 添加自定义事件监听器
      if (this.options.events) {
        this.options.events.forEach((eventName) => {
          this.eventSource.addEventListener(eventName, (event) => {
            this.onEvent?.(eventName, event);
          });
        });
      }
    } catch (error) {
      console.error("创建 SSE 连接失败:", error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;

      console.log(
        `${delay}ms后尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error("达到最大重连次数，停止重连");
      this.onMaxReconnectAttempts?.();
    }
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // 回调函数
  onOpen = null;
  onMessage = null;
  onError = null;
  onEvent = null;
  onMaxReconnectAttempts = null;
}

// 使用示例
const sseManager = new SSEManager("/api/events", {
  events: ["notification", "system_status"],
});

sseManager.onMessage = (event) => {
  console.log("收到消息:", event.data);
};

sseManager.onEvent = (eventName, event) => {
  console.log(`收到自定义事件 ${eventName}:`, event.data);
};
```

## 七、使用场景

1. **实时通知系统** - 新消息提醒、系统通知
2. **股票行情推送** - 实时价格更新
3. **新闻推送** - 实时新闻更新
4. **社交媒体动态** - 新帖子、新关注
5. **监控仪表盘** - 实时数据展示
6. **进度更新** - 长时间任务进度报告
7. **在线用户列表** - 用户上下线状态

## 八、优势和局限性

### 优势：

- ✅ 简单易用，API 简洁
- ✅ 自动重连机制
- ✅ 基于 HTTP，兼容性好
- ✅ 适合服务器向客户端的单向数据流

### 局限性：

- ❌ 只能服务器向客户端推送（单向）
- ❌ 不支持二进制数据
- ❌ 最大并发连接数限制（HTTP/1.1 为 6 个）
- ❌ 部分浏览器不支持（主要是 IE）

SSE 是构建实时应用的轻量级解决方案，特别适合需要服务器主动推送但不需要客户端向服务器发送大量数据的场景。
