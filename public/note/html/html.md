## DataUrl

### ✅ `data:text/html,${encodeURIComponent(html)}` 是什么？

这是一个使用 **[Data URI Scheme](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)** 的方式，将 HTML 代码直接当成网页内容加载。

---

### 🔍 分解解释：

```js
const html = "<html><body><h1>Hello</h1></body></html>";
const dataUrl = `data:text/html,${encodeURIComponent(html)}`;
```

#### - `data:` 是 Data URL 的协议头，表示后面是原始数据

#### - `text/html` 是 MIME 类型，表示是 HTML 内容

#### - `${encodeURIComponent(html)}` 会把 HTML 字符串变成 URL-safe 编码的字符串

结果类似于：

```plaintext
data:text/html,%3Chtml%3E%3Cbody%3E%3Ch1%3EHello%3C%2Fh1%3E%3C%2Fbody%3E%3C%2Fhtml%3E
```

---

### 💡 使用场景

#### ✅ 1. **Puppeteer 中加载本地 HTML 字符串**

```js
await page.goto(`data:text/html,${encodeURIComponent(html)}`);
```

避免了：

- 写入临时文件
- 使用本地服务器
- 图片或样式跨域问题

#### ✅ 2. **前端测试临时内容**

在浏览器地址栏直接粘贴：

```text
data:text/html,<h1>Hello World</h1>
```

会直接渲染成一个网页。

---

### ⚠️ 注意事项：

- `encodeURIComponent()` 必须用，防止 HTML 标签被误认为是 URL 控制字符
- 对于大型 HTML，Data URI 有长度限制（不同浏览器约为 2MB 左右）
- 图片、CSS、JS 也可以用类似方式嵌入（MIME 改成 `image/png` 等）

---

### ✨ 对比 `setContent()` vs `goto(data:text/html...)`

| 特性         | `setContent(html)`            | `goto(data:text/html...)`            |
| ------------ | ----------------------------- | ------------------------------------ |
| 简洁性       | 更直接                        | 需要手动编码                         |
| 是否触发导航 | 否（保持当前 URL）            | 是（新导航）                         |
| 支持加载事件 | 有限（不总是触发 `load`）     | 支持完整的页面生命周期事件           |
| 网络拦截     | 不支持 request 拦截等网络事件 | 支持 `page.on('request')` 等拦截逻辑 |

---

如果你需要加载的 HTML 是动态生成的（比如用 Handlebars），而且需要像真实网页那样加载图片、执行 `DOMContentLoaded`、`load` 等事件，**推荐使用 `page.goto(dataURL)`**。

需要我帮你封装成一个实用函数也可以说一声 😎
