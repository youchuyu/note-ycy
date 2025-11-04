# SSE

## 1. SSE 的概念

**SSE（Server-Sent Events）** 是一种 **单向实时通信技术**，允许服务器向浏览器推送实时数据，而浏览器不需要频繁轮询。

- 由 HTML5 标准定义。
- 浏览器通过 JavaScript 的 `EventSource` 对象订阅服务器发送的事件。
- 典型应用：实时消息、股票行情、通知、日志推送等。

> 简单理解：浏览器主动向服务器订阅，服务器主动推送数据给浏览器，浏览器无需再次请求。

---

## 2. SSE 的工作原理

SSE 基于 **HTTP 协议**，利用 **持久连接（HTTP 长连接）** 进行数据传输。

1. **浏览器发起请求**：

   ```javascript
   const evtSource = new EventSource("/events");
   ```

2. **服务器响应请求**：

   - 服务器返回响应头：

     ```
     Content-Type: text/event-stream
     Cache-Control: no-cache
     Connection: keep-alive
     ```

   - 浏览器保持连接不关闭。

3. **服务器推送数据**：

   - 数据格式是文本，每条消息以 `\n\n` 分隔。
   - 每条消息可以包含字段：

     ```
     data: Hello SSE\n\n
     id: 123\n
     event: message\n
     retry: 5000\n
     ```

4. **浏览器接收事件**：

   ```javascript
   evtSource.onmessage = function (event) {
     console.log("接收到数据:", event.data);
   };
   ```

---

## 3. SSE 消息格式

SSE 消息遵循 **text/event-stream** 格式，常用字段：

| 字段    | 说明                                                              |
| ------- | ----------------------------------------------------------------- |
| `data`  | 消息内容，多行以换行符分隔，每条 `data:` 都会被拼接为一条完整消息 |
| `id`    | 消息 ID，用于客户端断线重连后继续接收                             |
| `event` | 自定义事件类型，浏览器可通过 `addEventListener` 监听              |
| `retry` | 自动重连间隔时间（毫秒）                                          |

**示例：**

```
id: 1
event: message
data: Hello SSE
data: 这是第二行
retry: 3000

```

---

## 4. SSE 的特点

| 特性              | 描述                                                            |
| ----------------- | --------------------------------------------------------------- |
| 单向              | 服务器向客户端推送数据，客户端不能直接通过 SSE 发送数据给服务器 |
| 长连接            | HTTP 连接保持开启，减少轮询开销                                 |
| 自动重连          | 浏览器会在连接断开后自动重连（可通过 `retry` 设置间隔）         |
| 支持事件类型      | 可定义自定义事件，区分不同数据类型                              |
| 文本传输          | 数据是纯文本（可用 JSON 序列化发送）                            |
| 与 WebSocket 区别 | SSE 是单向、基于 HTTP，WebSocket 是双向、基于 TCP               |

---

## 5. SSE 的使用方法

### 5.1 浏览器端

```javascript
// 创建 EventSource 对象
const evtSource = new EventSource("/events");

// 默认监听 message 事件
evtSource.onmessage = (event) => {
  console.log("接收到数据:", event.data);
};

// 监听自定义事件
evtSource.addEventListener("update", (event) => {
  console.log("更新事件:", event.data);
});

// 错误处理
evtSource.onerror = (err) => {
  console.error("SSE 错误:", err);
};
```

### 5.2 服务器端示例（Node.js Express）

```javascript
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let count = 0;

  const interval = setInterval(() => {
    count++;
    res.write(`data: 服务器推送消息 ${count}\n\n`);
    if (count >= 5) clearInterval(interval);
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});
```

---

## 6. SSE 的优缺点

### 优点

- **简单易用**：浏览器原生支持，无需额外库。
- **自动重连**：浏览器会自动断线重连。
- **轻量**：基于 HTTP，使用现有基础设施，无需升级协议。

### 缺点

- **单向通信**：客户端无法通过 SSE 向服务器发送数据。
- **HTTP/1.1 长连接限制**：大量用户同时使用时，服务器压力大。
- **跨域限制**：需要 CORS 支持。
- **浏览器兼容性**：大部分现代浏览器支持，但 IE 不支持。

---

## 7. SSE 与 WebSocket 对比

| 特性         | SSE                      | WebSocket                |
| ------------ | ------------------------ | ------------------------ |
| 通信方向     | 服务器 → 客户端          | 双向                     |
| 协议         | HTTP                     | TCP/WebSocket            |
| 浏览器支持   | 原生支持（EventSource）  | 原生支持（WebSocket）    |
| 自动重连     | 支持                     | 需手动实现               |
| 传输数据类型 | 文本（需 JSON 序列化）   | 文本/二进制              |
| 适用场景     | 实时通知、日志、消息推送 | 游戏、聊天、双向实时交互 |

---

## 8. SSE 使用注意事项

1. **保持连接**：服务器要防止连接被中间代理或防火墙关闭，可定期发送空数据：

   ```
   : keep-alive\n\n
   ```

2. **CORS 设置**：

   ```http
   Access-Control-Allow-Origin: *
   ```

3. **数据大小**：一次发送的数据不要太大，避免浏览器阻塞。
4. **代理支持**：某些代理可能缓存 SSE 响应，需要设置 `Cache-Control: no-cache`。

---

SSE 是一个 **轻量、单向、易用的实时通信方案**，适合实时推送数据而不需要双向交互的场景。

---

如果你需要，我可以帮你画一张 **SSE 数据流示意图**，清楚展示浏览器和服务器的连接、消息发送和重连机制。

你想让我画吗？
