# websocket

好的，关于 WebSocket 的使用，我将为您提供一个从基础概念到实际应用的全面介绍。

## 一、什么是 WebSocket？

WebSocket 是一种在单个 TCP 连接上进行**全双工通信**的网络协议。它解决了 HTTP 协议在实时通信方面的局限性。

### 与传统 HTTP 的区别：

- **HTTP**：单向请求-响应模式，客户端发起请求，服务器返回响应
- **WebSocket**：双向持久连接，服务器可以主动向客户端推送数据

## 二、WebSocket 的核心特点

1. **全双工通信**：客户端和服务器可以同时发送和接收数据
2. **低延迟**：建立连接后，数据传输无需每次握手
3. **减少开销**：数据帧头部很小，适合高频次通信
4. **跨域支持**：内置支持跨域通信

## 三、WebSocket 的基本使用

### 1. 创建 WebSocket 连接

```javascript
// 创建 WebSocket 连接
const socket = new WebSocket("ws://localhost:8080");

// 如果是加密连接，使用 wss
// const socket = new WebSocket('wss://api.example.com');
```

### 2. 监听连接事件

```javascript
// 连接建立成功
socket.addEventListener("open", (event) => {
  console.log("WebSocket 连接已建立");
  // 连接建立后可以发送数据
  socket.send("Hello Server!");
});

// 接收服务器消息
socket.addEventListener("message", (event) => {
  console.log("收到服务器消息:", event.data);
  // 通常数据是 JSON 格式，需要解析
  try {
    const data = JSON.parse(event.data);
    console.log("解析后的数据:", data);
  } catch (e) {
    console.log("原始数据:", event.data);
  }
});

// 连接关闭
socket.addEventListener("close", (event) => {
  console.log("WebSocket 连接已关闭", event.code, event.reason);
});

// 错误处理
socket.addEventListener("error", (event) => {
  console.error("WebSocket 错误:", event);
});
```

### 3. 发送数据

```javascript
// 发送文本数据
socket.send("简单的文本消息");

// 发送 JSON 数据
const message = {
  type: "chat",
  content: "Hello World!",
  timestamp: Date.now(),
};
socket.send(JSON.stringify(message));

// 发送二进制数据
const buffer = new ArrayBuffer(16);
socket.send(buffer);
```

### 4. 关闭连接

```javascript
// 正常关闭连接
socket.close(1000, "正常关闭");

// 常用的关闭代码：
// 1000 - 正常关闭
// 1001 - 端点离开
// 1002 - 协议错误
// 1003 - 不接受的数据类型
```

## 四、服务端实现示例

### Node.js + ws 库示例

```javascript
const WebSocket = require("ws");

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8080 });

// 存储所有连接的客户端
const clients = new Set();

wss.on("connection", (ws, request) => {
  console.log("新的客户端连接");
  clients.add(ws);

  // 获取客户端 IP
  const clientIP = request.socket.remoteAddress;

  // 向客户端发送欢迎消息
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "连接成功",
      timestamp: Date.now(),
    })
  );

  // 广播新用户加入（给所有客户端）
  broadcast(
    {
      type: "user_joined",
      message: `新用户加入，当前在线: ${clients.size}`,
      timestamp: Date.now(),
    },
    ws
  ); // 排除自己

  // 接收客户端消息
  ws.on("message", (data) => {
    console.log("收到客户端消息:", data.toString());

    try {
      const message = JSON.parse(data);

      // 处理不同类型的消息
      switch (message.type) {
        case "chat":
          // 广播聊天消息给所有客户端
          broadcast({
            type: "chat",
            user: clientIP,
            content: message.content,
            timestamp: Date.now(),
          });
          break;

        case "ping":
          // 响应心跳包
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: Date.now(),
            })
          );
          break;
      }
    } catch (error) {
      console.error("消息解析错误:", error);
    }
  });

  // 连接关闭
  ws.on("close", () => {
    console.log("客户端断开连接");
    clients.delete(ws);

    // 广播用户离开
    broadcast({
      type: "user_left",
      message: `用户离开，当前在线: ${clients.size}`,
      timestamp: Date.now(),
    });
  });

  // 错误处理
  ws.on("error", (error) => {
    console.error("WebSocket 错误:", error);
  });
});

// 广播消息给所有客户端
function broadcast(message, excludeWs = null) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

console.log("WebSocket 服务器运行在 ws://localhost:8080");
```

## 五、高级特性与最佳实践

### 1. 心跳机制（保持连接活跃）

```javascript
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.pingInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      console.log("连接成功");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    this.socket.addEventListener("message", (event) => {
      this.handleMessage(event.data);
    });

    this.socket.addEventListener("close", () => {
      console.log("连接断开");
      this.stopHeartbeat();
      this.attemptReconnect();
    });

    this.socket.addEventListener("error", (error) => {
      console.error("连接错误:", error);
    });
  }

  startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 30000); // 每30秒发送一次心跳
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * this.reconnectAttempts, 30000);

      console.log(
        `${delay}ms后尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error("达到最大重连次数，停止重连");
    }
  }

  send(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket 未连接，无法发送消息");
    }
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case "pong":
          console.log("收到心跳响应");
          break;
        case "chat":
          this.onChatMessage(message);
          break;
        default:
          console.log("未知消息类型:", message.type);
      }
    } catch (error) {
      console.error("消息处理错误:", error);
    }
  }

  onChatMessage(message) {
    // 处理聊天消息
    console.log("收到聊天消息:", message);
  }

  close() {
    this.stopHeartbeat();
    this.socket.close(1000, "用户主动关闭");
  }
}

// 使用示例
const wsManager = new WebSocketManager("ws://localhost:8080");
```

### 2. 消息协议设计

```javascript
// 定义消息类型
const MessageType = {
  AUTH: "auth", // 认证
  CHAT: "chat", // 聊天
  NOTIFICATION: "notification", // 通知
  HEARTBEAT: "heartbeat", // 心跳
  ERROR: "error", // 错误
};

// 创建消息工厂
class MessageFactory {
  static createAuth(token) {
    return {
      type: MessageType.AUTH,
      token,
      timestamp: Date.now(),
    };
  }

  static createChat(content, roomId) {
    return {
      type: MessageType.CHAT,
      content,
      roomId,
      timestamp: Date.now(),
    };
  }

  static createHeartbeat() {
    return {
      type: MessageType.HEARTBEAT,
      timestamp: Date.now(),
    };
  }
}

// 使用
const authMessage = MessageFactory.createAuth("user-token-123");
socket.send(JSON.stringify(authMessage));
```

## 六、使用场景

1. **实时聊天应用**
2. **在线游戏**
3. **股票行情推送**
4. **协同编辑工具**
5. **实时监控仪表盘**
6. **在线拍卖/竞拍**
7. **多人视频会议**

## 七、注意事项

1. **连接稳定性**：网络波动可能导致连接断开，需要重连机制
2. **安全性**：使用 WSS（WebSocket Secure）进行加密传输
3. **性能考虑**：避免频繁发送小数据包，可以合并发送
4. **浏览器兼容性**：现代浏览器都支持 WebSocket
5. **服务器负载**：大量长连接会占用服务器资源

WebSocket 为现代 Web 应用提供了强大的实时通信能力，是构建交互式、实时应用的理想选择。

# 常见问题汇总

在前端开发和网络通信领域，WebSocket 是一个常被问及的面试主题。以下是一些常见的 WebSocket 面试题及其简要解答，帮助你更好地准备相关面试：

---

### 1. **什么是 WebSocket？它与 HTTP 有何区别？**

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议，允许服务器主动向客户端推送数据，实现实时双向通信。与传统的 HTTP 协议相比，WebSocket 在建立连接后无需重复进行请求和响应，减少了通信开销，提高了实时性。([CSDN 博客][1])

---

### 2. **WebSocket 的通信过程是怎样的？**

WebSocket 的通信过程包括两个阶段：

1. **握手阶段**：客户端发起 HTTP 请求，包含 `Upgrade: websocket` 等头部，服务器响应 `101 Switching Protocols` 状态码，完成协议升级。([chodocs.cn][2])

2. **数据传输阶段**：建立连接后，客户端和服务器之间可以通过 WebSocket 协议进行双向的数据传输，直到连接关闭。([vue3js.cn][3])

---

### 3. **如何处理 WebSocket 的断线重连？**

为了保持连接的稳定性，通常采用心跳机制和重连策略：

- **心跳机制**：客户端定期发送心跳消息，服务器响应，以检测连接是否正常。

- **重连策略**：在连接断开时，客户端可以使用指数退避等算法尝试重新建立连接。

---

### 4. **WebSocket 的应用场景有哪些？**

WebSocket 适用于需要实时通信的应用场景，例如：

- 即时聊天应用([CSDN 博客][1])

- 在线游戏

- 实时数据推送（如股票行情、体育比分）([CSDN 博客][1])

- 协同编辑工具([chodocs.cn][2])

---

### 5. **WebSocket 的安全性如何保障？**

WebSocket 本身不加密数据，建议使用加密的 `wss://` 协议（基于 TLS）来确保数据传输的安全性。此外，还应在应用层实现身份验证和权限控制，防止未授权的访问。

---

### 6. **WebSocket 与轮询、长轮询、SSE 的区别是什么？**

- **轮询**：客户端定期发送请求，询问服务器是否有新数据，效率较低。([博客园][4])

- **长轮询**：客户端发送请求，服务器在有新数据时才响应，减少了请求次数，但仍需重复建立连接。

- **SSE（Server-Sent Events）**：服务器可以主动向客户端推送数据，但仅支持单向通信。([chodocs.cn][2])

- **WebSocket**：支持双向通信，建立一次连接后，客户端和服务器可以随时互相发送数据，适用于实时性要求高的应用。([CSDN 博客][5])

---

### 7. **如何在浏览器中使用 WebSocket？**

可以使用原生的 WebSocket API：

```javascript
const socket = new WebSocket("wss://example.com/socket");

socket.onopen = () => {
  console.log("连接已建立");
  socket.send("Hello Server!");
};

socket.onmessage = (event) => {
  console.log("收到消息:", event.data);
};

socket.onclose = () => {
  console.log("连接已关闭");
};

socket.onerror = (error) => {
  console.error("发生错误:", error);
};
```

---

### 8. **WebSocket 的数据传输格式有哪些？**

WebSocket 支持传输文本数据和二进制数据。在 JavaScript 中，可以使用 `Blob` 或 `ArrayBuffer` 处理二进制数据。

---

### 9. **如何处理 WebSocket 的错误和异常？**

可以通过监听 `onerror` 和 `onclose` 事件来处理错误和异常情况。例如，在连接关闭时尝试重新连接，或在发生错误时提示用户。

---

### 10. **WebSocket 的限制和注意事项有哪些？**

- **浏览器兼容性**：虽然现代浏览器普遍支持 WebSocket，但仍需注意某些旧版浏览器的兼容性问题。

- **连接数量限制**：浏览器对每个域名的并发连接数有限制，需合理管理连接。

- **资源管理**：WebSocket 连接是持久的，需注意在不再需要时关闭连接，释放资源。

---

希望以上内容能帮助你更好地理解 WebSocket，并在面试中应对相关问题。如果你有特定的面试方向（如前端、后端、全栈）或需要更深入的讲解，欢迎继续提问。

[1]: https://blog.csdn.net/weixin_45926119/article/details/138080720?utm_source=chatgpt.com "WebSocket常问的面试题原创 - CSDN博客"
[2]: https://chodocs.cn/interview/net/websocket/?utm_source=chatgpt.com "WebSocket 常见面试题 - ChoDocs"
[3]: https://vue3js.cn/interview/http/WebSocket.html?utm_source=chatgpt.com "面试官：说说对WebSocket的理解？应用场景？ | web前端面试 - Vue3"
[4]: https://www.cnblogs.com/zhaozhitong/p/12450124.html?utm_source=chatgpt.com "WebSocket面试题- 赵大先生 - 博客园"
[5]: https://blog.csdn.net/2401_84140347/article/details/137620464?utm_source=chatgpt.com "WebSocket学习，2024年最新2024Android常见面试题原创"

# 身份验证

WebSocket 本身不像 HTTP 有内建的身份验证机制（比如 Cookie、Token 自动携带）。所以 **WebSocket 的身份验证** 一般是通过以下方式之一手动实现的：

---

## ✅ 常见身份验证方式

### 1. **通过 URL 查询参数（简单但不太安全）**

```js
const socket = new WebSocket("ws://example.com/ws?token=your_jwt_token");
```

服务端解析参数：

```js
const url = require("url");

wss.on("connection", function connection(ws, req) {
  const params = new URLSearchParams(url.parse(req.url).query);
  const token = params.get("token");

  if (!isValidToken(token)) {
    ws.close(); // 拒绝连接
    return;
  }

  console.log("认证成功，建立连接");
});
```

---

### 2. **通过初始消息传 Token（更安全）**

客户端连接后马上发送 token：

```js
const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
  socket.send(JSON.stringify({ type: "auth", token: "your_jwt_token" }));
};
```

服务器端验证：

```js
wss.on("connection", (ws) => {
  let isAuthenticated = false;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (!isAuthenticated) {
      if (data.type === "auth" && isValidToken(data.token)) {
        isAuthenticated = true;
        ws.send("认证成功");
      } else {
        ws.send("认证失败");
        ws.close();
      }
      return;
    }

    // 后续消息处理
    if (isAuthenticated) {
      console.log("处理业务消息:", data);
    }
  });
});
```

---

### 3. **通过 Cookie（适用于浏览器且服务端有同源权限）**

在浏览器中连接：

```js
const socket = new WebSocket("ws://example.com/ws");
```

服务器中读取 Cookie：

```js
const cookie = require("cookie");

wss.on("connection", (ws, req) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies["auth_token"];

  if (!isValidToken(token)) {
    ws.close();
  }
});
```

⚠️ 缺点：跨域时 Cookie 可能无法携带，依赖服务端设置 CORS、SameSite 等策略。

---

## 🔐 Token 验证通常用 JWT

`isValidToken()` 函数一般就是解析 JWT 并校验签名，例如用 `jsonwebtoken`：

```js
const jwt = require("jsonwebtoken");

function isValidToken(token) {
  try {
    const decoded = jwt.verify(token, "your-secret");
    return true;
  } catch (err) {
    return false;
  }
}
```

---

## ✅ 推荐实践

- **生产环境推荐第 2 种（连接后先发 token）**
- token 建议用 **JWT（带过期时间）**
- 鉴权成功后，服务器可以给 `ws` 对象挂上 `userId` 或 `userInfo` 做后续鉴权

---

如果你正在实现某个具体项目的登录/认证逻辑，我可以帮你从登录开始一直接到 WebSocket 连接鉴权，按你项目的结构来设计～你现在用的是哪种框架？前端是 React / Vue？服务端是 Node.js 还是其他？

# 心跳包

心跳包（Heartbeat）是 WebSocket 和其他长连接通信中一个非常重要的机制，用来检测连接是否仍然有效，以及防止中间网络设备（如路由器、防火墙）因为“太久没数据”而断开连接。

---

## ❤️ 什么是心跳包？

**心跳包**是一种定时发送的小数据包，通常没什么业务含义，只是为了：

1. 保持连接活跃（防断开）
2. 检测对方是否存活（及时发现掉线）

---

## 🧠 工作原理

客户端或服务器每隔一定时间（比如 30 秒）发一个消息，对方收到后也可以立即回应一个心跳回应（或者安静接受）：

```
Client  ——>  {"type": "ping"}
Server  ——>  {"type": "pong"}
```

- 如果在某段时间内没收到对方任何消息 → 判定连接断开，自动重连或清理。

---

## 💻 示例：Node.js 实现 WebSocket 心跳检测

### 服务端（使用 `ws` 库）：

```js
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

function heartbeat() {
  this.isAlive = true;
}

server.on("connection", function connection(ws) {
  ws.isAlive = true;
  ws.on("pong", heartbeat); // 收到客户端 pong 则标记存活

  ws.on("message", (msg) => {
    console.log("客户端消息：", msg);
  });
});

// 每 30 秒检查一次客户端是否还活着
const interval = setInterval(() => {
  server.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate(); // 没响应就断开
    }

    ws.isAlive = false;
    ws.ping(); // 发送 ping，等待 pong
  });
}, 30000);
```

---

### 客户端（浏览器）：

```js
const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
  console.log("连接成功");

  // 每 30 秒发个心跳
  setInterval(() => {
    socket.send(JSON.stringify({ type: "ping" }));
  }, 30000);
};

socket.onmessage = (event) => {
  console.log("服务端消息：", event.data);
};

socket.onclose = () => {
  console.log("连接断开");
};
```

---

## 📝 补充说明

| 内容           | 建议值               |
| -------------- | -------------------- |
| 心跳间隔       | 20-60 秒             |
| 心跳内容格式   | JSON，带 `type` 字段 |
| 是否双向心跳   | 可以，通常一方发就够 |
| 掉线后是否重连 | 客户端常做重连处理   |

---

如果你有具体的 WebSocket 项目，我可以帮你加上完整的心跳机制（前后端都行）～你是用什么框架在做？或者你想在 React Native 项目中加上这个机制吗？

# 重连机制

重连机制（Reconnect Mechanism）是指当客户端和服务器之间的连接意外断开时，客户端会**自动尝试重新连接**，以保证服务的持续可用性。这在 **WebSocket** 或任何长连接中都非常关键，特别是在网络不稳定或用户频繁切换网络时。

---

## 🔄 为什么需要重连？

WebSocket 是一条长连接，连接一旦中断，客户端不会自动重连，所以我们需要手动实现。

**常见断开原因：**

- 网络临时中断（Wi-Fi 切 4G）
- 服务端重启
- 心跳超时判定为掉线
- 手机进入休眠模式

---

## 🧠 重连机制的基本思路

1. **监听断开事件**（`onclose` 或 `onerror`）
2. **尝试连接**（延迟一段时间）
3. **设置最大重试次数**或指数退避机制
4. **连接成功后清除重连状态**

---

## 💻 示例：简单 WebSocket 自动重连（浏览器端）

```js
let socket;
let reconnectTimer;
let retryCount = 0;
const maxRetries = 5;

function connect() {
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    console.log("✅ 连接成功");
    retryCount = 0;
    if (reconnectTimer) clearTimeout(reconnectTimer);
  };

  socket.onmessage = (event) => {
    console.log("收到消息:", event.data);
  };

  socket.onerror = (err) => {
    console.log("❌ 连接出错", err);
  };

  socket.onclose = () => {
    console.log("⚠️ 连接断开，准备重连");
    if (retryCount < maxRetries) {
      reconnectTimer = setTimeout(() => {
        retryCount++;
        console.log(`🔁 第 ${retryCount} 次重连...`);
        connect();
      }, 1000 * retryCount); // 指数退避
    } else {
      console.log("🚫 达到最大重连次数");
    }
  };
}

connect();
```

---

## ⏱️ 更高级的重连策略

| 策略类型     | 描述                                               |
| ------------ | -------------------------------------------------- |
| 固定间隔     | 每次固定间隔重连（比如每 3 秒）                    |
| 指数退避     | 重连时间逐步变长（1s、2s、4s、8s...）              |
| 抖动机制     | 在重连时间上增加一点随机时间，防止雪崩连接         |
| 最大次数限制 | 避免无限重连浪费资源                               |
| 网络恢复监听 | 可监听 `navigator.onLine` 或 `online/offline` 事件 |

---

## 📱 React Native 用户注意

在移动端，比如使用 React Native，还可以监听 App 生命周期：

```ts
import { AppState } from "react-native";

AppState.addEventListener("change", (state) => {
  if (state === "active" && socket?.readyState !== 1) {
    // App 回到前台并且连接断了，尝试重连
    connect();
  }
});
```

---

如果你正在做具体的 WebSocket 项目，我可以帮你封装一个带心跳 + 重连的 WebSocket 管理类（支持 React、React Native 或其他框架），要不要我写一个完整的？

## 断联处理示例

```ts
async createDefaultEmojiByStream(payload, signal) {
    const { toggleIsCreating, switchCreateStatus } = get();
    toggleIsCreating(true);
    switchCreateStatus(CREATE_STATUS.CREATING);
    const errorEvent = () => {
      console.log('disconnect!!!!!!!!!!!!!');
      toggleIsCreating(false);
      switchCreateStatus(CREATE_STATUS.FAILED);
      showToast('当前网络信号差，请重试~');
    };

    makeDefaultEmojiStream(
      payload,
      msg => {
        if (signal?.aborted) {
          return;
        }
        if (msg.msgType === StreamMsgType.STREAM_MSG_IMAGE) {
          set({ emojiInfo: (msg?.emoji as EmojiInfo) ?? null });
          toggleIsCreating(false);
        }
        if (msg.isFinish) {
          console.log('finish!!!!!!!!!!!!', msg);
          switchCreateStatus(null);
          Socket.events.off('disconnect', errorEvent);
        }
      },
      e => {
        console.log(11111111111, payload, e);
        toggleIsCreating(false);
        switchCreateStatus(CREATE_STATUS.FAILED);
        Socket.events.off('disconnect', errorEvent);
      }
    );

    Socket.events.on('disconnect', errorEvent, true);
  }
```

# 中断 AbortController

`AbortController` 是 Web 平台提供的一个用于 **中止异步操作（如 fetch 请求）** 的 API，常用于网络请求的取消、超时控制、用户中止等场景。

---

## 🧠 基本概念

- `AbortController` 是一个控制器。
- 它的 `signal` 属性是一个 `AbortSignal` 对象，传递给支持中止的 API（如 `fetch`）。
- 调用 `abort()` 方法可以通知相关操作中止。

---

## ✅ 基本用法

```js
const controller = new AbortController();
const signal = controller.signal;

fetch("/api/data", { signal })
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => {
    if (err.name === "AbortError") {
      console.log("请求被中止");
    } else {
      console.error("其他错误", err);
    }
  });

// 3 秒后中止请求
setTimeout(() => {
  controller.abort();
}, 3000);
```

---

## 🔄 典型使用场景

| 场景                   | 描述                                 |
| ---------------------- | ------------------------------------ |
| 用户切换页面           | 主动取消上一个请求，避免无效数据注入 |
| 输入搜索防抖           | 用户输入过程中取消前一个请求         |
| 实现请求超时           | 超过一定时间未响应就自动 abort       |
| React 中组件卸载时清理 | 防止 setState 在卸载组件上抛出错误   |

---

## ⏱ 配合超时实现请求超时

```js
function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}
```

---

## 💥 中止后会发生什么？

- `fetch` 会被拒绝，抛出一个名为 `"AbortError"` 的错误。
- `XMLHttpRequest`（手动实现）也支持 `abort()`。
- 自定义异步函数也可以手动监听 `signal.aborted`。

---

## ⚠️ 注意事项

- 多次调用 `.abort()` 没有副作用。
- 一个 `AbortSignal` 只能控制一次中断，不能重置（如需重复控制，请新建 `AbortController`）。
- 并非所有异步操作都支持 `signal`，需要目标 API 显式支持（如 `fetch`、`ReadableStream` 等）。

---

## ✅ 高级技巧：多个请求共享中断信号

```js
const controller = new AbortController();

fetch("/api/a", { signal: controller.signal });
fetch("/api/b", { signal: controller.signal });

// 一次 abort，两个请求都被中止
controller.abort();
```

---

## 🧩 React 中常用写法（useEffect 清理）

```js
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(...).catch(...);

  return () => controller.abort(); // 组件卸载时中止请求
}, []);
```

---

## 📦 和第三方库集成

- **Axios（支持但默认不启用）**：

```js
axios.get("/api", { signal: controller.signal });
```

- **React Query / SWR** 也可以通过配置取消请求。

## 通用场景

是的，`AbortController` **不仅可以与 `fetch` 配合使用**，它是一个通用的 **信号传递机制**，可以被你主动监听，在任何异步流程中“自定义中断逻辑”。

- `AbortController` 提供一个 `.signal`；
- 你可以在自己的逻辑中手动监听 `signal.aborted`；
- 当 `.abort()` 被调用时，你可以执行任何清理、关闭、中断等动作。

虽然 WebSocket 本身不直接支持 `signal` 选项（不像 `fetch`），**但你可以配合它实现“用户主动断开”控制**。

### 示例：使用 AbortController 控制 WebSocket 生命周期

```ts
function createAbortableWebSocket(url: string, signal: AbortSignal): WebSocket {
  const ws = new WebSocket(url);

  ws.addEventListener("open", () => {
    console.log("WebSocket 连接已打开");
  });

  ws.addEventListener("message", (event) => {
    console.log("收到消息：", event.data);
  });

  ws.addEventListener("close", () => {
    console.log("WebSocket 已关闭");
  });

  ws.addEventListener("error", (err) => {
    console.error("WebSocket 错误", err);
  });

  // 响应中止信号：关闭 WebSocket
  signal.addEventListener("abort", () => {
    console.log("收到 abort 信号，关闭 WebSocket");
    ws.close(1000, "用户取消连接");
  });

  return ws;
}
```

### 使用方式：

```ts
const controller = new AbortController();
const ws = createAbortableWebSocket(
  "wss://example.com/socket",
  controller.signal
);

// 5 秒后主动中止
setTimeout(() => {
  controller.abort();
}, 5000);
```

### 🛠️ 自定义任务中也可监听中止

你也可以在自己的 `setTimeout`、`Promise`、异步逻辑中添加：

```ts
if (signal.aborted) {
  return;
}
signal.addEventListener("abort", () => {
  // 执行中止逻辑
});
```
