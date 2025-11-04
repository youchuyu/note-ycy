# Cookie

## 1. Cookie 的概念

**Cookie** 是浏览器端存储的一种小型文本信息，由服务器发送并保存在客户端（浏览器），用于在客户端与服务器之间保持状态信息。

> 简单理解：HTTP 是无状态协议，每次请求服务器，服务器都不知道之前发生了什么。Cookie 就是浏览器存储状态的小工具。

- **特点**：

  - 存储在客户端浏览器中。
  - 每个 Cookie 体积小（通常 ≤ 4KB）。
  - 会随着 HTTP 请求发送给服务器（只要域名匹配）。
  - 可以设置过期时间（Session 或 Persistent）。

---

## 2. Cookie 的结构

一个典型的 Cookie 通常包含以下信息：

| 字段                          | 说明                                             |
| ----------------------------- | ------------------------------------------------ |
| 名称（Name）                  | Cookie 的键                                      |
| 值（Value）                   | 对应的值                                         |
| 域（Domain）                  | Cookie 所属的域名，匹配域名时才会发送给服务器    |
| 路径（Path）                  | Cookie 可访问的路径，只有路径匹配时才发送        |
| 过期时间（Expires / Max-Age） | Cookie 的生命周期，超过时间会被浏览器删除        |
| 安全标志（Secure）            | 仅在 HTTPS 请求中发送 Cookie                     |
| HttpOnly                      | JS 无法读取，仅在 HTTP 请求中发送，防止 XSS 攻击 |
| SameSite                      | 限制跨站请求发送 Cookie（Strict、Lax、None）     |

示例：

```
Set-Cookie: sessionId=abc123; Domain=example.com; Path=/; Expires=Wed, 02 Nov 2025 23:59:59 GMT; HttpOnly; Secure; SameSite=Lax
```

---

## 3. Cookie 的类型

1. **Session Cookie（会话 Cookie）**

   - 不设置过期时间。
   - 浏览器关闭时自动删除。
   - 用于临时存储用户状态，比如登录状态。

2. **Persistent Cookie（持久 Cookie）**

   - 设置了过期时间。
   - 即使关闭浏览器，也会在指定时间内保留。
   - 常用于“记住我”功能。

3. **First-Party Cookie**

   - 与访问的域名相同的 Cookie。
   - 由当前网站设置。

4. **Third-Party Cookie**

   - 与访问的域名不同，由其他域（广告、分析）设置。
   - 常用于广告追踪，但现代浏览器逐渐限制第三方 Cookie。

---

## 4. Cookie 的工作原理

HTTP 请求/响应中的 Cookie 流程如下：

1. **服务器设置 Cookie**：

   - 服务器在 HTTP 响应头中发送 `Set-Cookie`：

     ```
     HTTP/1.1 200 OK
     Set-Cookie: userId=123; Path=/; HttpOnly
     ```

   - 浏览器接收到后保存。

2. **浏览器发送 Cookie**：

   - 下次请求同域名路径的资源时，会在请求头带上 Cookie：

     ```
     GET /dashboard HTTP/1.1
     Host: example.com
     Cookie: userId=123
     ```

3. **服务器读取 Cookie**：

   - 服务器解析请求头中的 Cookie，以识别用户状态或存储信息。

---

## 5. Cookie 的常见用途

- **用户认证**：存储登录状态（sessionId）。
- **用户偏好**：主题、语言设置。
- **购物车信息**：电商网站临时保存用户选择的商品。
- **统计分析**：访问量、用户行为追踪。
- **跨站点功能**：广告和推荐（通过第三方 Cookie）。

---

## 6. Cookie 的安全问题与防护

1. **XSS（跨站脚本攻击）**

   - 如果 Cookie 可以被 JS 读取，会被恶意脚本窃取。
   - 防护：设置 `HttpOnly`。

2. **CSRF（跨站请求伪造）**

   - 浏览器会自动带 Cookie，攻击者可能利用。
   - 防护：设置 `SameSite` 或 CSRF Token。

3. **明文传输**

   - HTTP 中传输的 Cookie 可能被截获。
   - 防护：使用 `Secure` 只在 HTTPS 下传输。

4. **Cookie 污染**

   - Cookie 名称冲突或被篡改。
   - 防护：对关键 Cookie 进行签名或加密。

---

## 7. JS 中操作 Cookie

浏览器端可以通过 `document.cookie` 访问和设置 Cookie：

```javascript
// 设置 Cookie
document.cookie = "username=Tom; path=/; max-age=3600";

// 读取 Cookie
console.log(document.cookie); // 输出类似: "username=Tom"

// 删除 Cookie
document.cookie = "username=; path=/; max-age=0";
```

> 注意：JS 只能访问非 HttpOnly Cookie。

---

## 8. Cookie 与 LocalStorage / SessionStorage 对比

| 特性           | Cookie             | LocalStorage     | SessionStorage |
| -------------- | ------------------ | ---------------- | -------------- |
| 存储大小       | 小（4KB）          | 大（5~10MB）     | 大（5~10MB）   |
| 自动随请求发送 | 是                 | 否               | 否             |
| 生命周期       | Session 或过期时间 | 永久             | 会话结束       |
| 可被 JS 访问   | 是（除 HttpOnly）  | 是               | 是             |
| 用途           | 会话、认证、追踪   | 存储大数据、状态 | 临时状态       |

---

总的来说，Cookie 是 web 开发中非常基础但又容易被忽视的机制，它解决了 **HTTP 无状态** 的问题，同时也带来了安全挑战。

---

如果你需要，我可以帮你画一张 **Cookie 流程图**，清晰展示浏览器和服务器之间 Cookie 的交互流程。

你想让我画吗？
