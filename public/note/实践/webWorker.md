# web worker

好的，我们来系统介绍一下 **Web Worker**，这是前端处理 **大计算量或长任务**时非常重要的技术，可以显著提升页面性能和用户体验。

---

## 🧩 一、什么是 Web Worker

**Web Worker** 是浏览器提供的一种 **在后台线程运行 JavaScript 的机制**，用来避免 **阻塞主线程（UI 线程）**。

- 主线程负责 **渲染页面、响应用户交互**
- Worker 线程负责 **计算、数据处理、文件切片、加密等耗时任务**

特点：

1. **运行在独立线程**，不会阻塞 UI
2. **不能访问 DOM**（主线程才有 DOM 权限）
3. **线程间通信通过消息传递** (`postMessage`)
4. **适合计算密集型任务**或大文件处理

---

## 🏗️ 二、Web Worker 类型

| 类型                 | 说明                                | 特点                           |
| -------------------- | ----------------------------------- | ------------------------------ |
| **Dedicated Worker** | 一个 worker 对应一个脚本/线程       | 最常用，简单                   |
| **Shared Worker**    | 多个窗口或 iframe 共享同一个 worker | 共享数据，跨窗口通信           |
| **Service Worker**   | 用于拦截网络请求、离线缓存          | 不直接操作 UI，适合 PWA        |
| **Module Worker**    | ES6 module 形式的 worker            | 支持 import/export，现代浏览器 |

---

## ⚙️ 三、使用方法（Dedicated Worker）

### 1️⃣ 创建 worker

**worker.js**

```js
// worker.js
self.onmessage = (e) => {
  const result = e.data * 2; // 简单计算示例
  postMessage(result); // 发送结果回主线程
};
```

**main.js**

```js
const worker = new Worker("worker.js");

worker.onmessage = (e) => {
  console.log("Worker 结果:", e.data);
};

worker.postMessage(10); // 发送数据给 worker
```

---

### 2️⃣ 终止 worker

```js
worker.terminate(); // 释放线程资源
```

---

### 3️⃣ Worker 与主线程通信

- **主线程 → Worker**

```js
worker.postMessage({ type: "start", payload: data });
```

- **Worker → 主线程**

```js
self.postMessage({ type: "progress", payload: 50 });
```

> ⚡ 注意：消息传递是 **异步复制**（可用 Transferable Objects 提升效率）

---

### 4️⃣ Transferable Objects（零拷贝）

- 对大数组、ArrayBuffer，避免拷贝开销

```js
// 主线程
const buffer = new ArrayBuffer(1024 * 1024);
worker.postMessage(buffer, [buffer]); // buffer 转移，主线程不可再用

// Worker
self.onmessage = (e) => {
  const buffer = e.data;
  // 可直接使用
};
```

---

### 5️⃣ 在 React / SPA 中使用

封装成 Hook：

```js
import { useEffect, useRef } from "react";

export function useWorker(url, onMessage) {
  const workerRef = useRef(null);

  useEffect(() => {
    const worker = new Worker(url);
    workerRef.current = worker;

    worker.onmessage = (e) => onMessage(e.data);

    return () => worker.terminate();
  }, [url, onMessage]);

  const post = (data) => workerRef.current?.postMessage(data);
  return post;
}
```

使用：

```js
const sendToWorker = useWorker("worker.js", (data) => {
  console.log("Worker 结果", data);
});

sendToWorker(100);
```

---

## 🧩 四、常见应用场景

1. **大文件处理 / 上传**

   - 文件切片、压缩、加密、hash 计算

2. **数据计算 / 可视化**

   - 大量数组计算、图表渲染前处理

3. **图像处理**

   - Canvas 图像合成、滤镜处理

4. **加密 / 解密**

   - RSA/AES 算法运算，避免阻塞 UI

5. **复杂动画 / 游戏逻辑**

   - 物理计算、路径寻找、碰撞检测

---

## ⚡ 五、注意事项

1. **不能操作 DOM**

   - 所有 UI 更新必须在主线程完成

2. **通信成本**

   - 数据通过 `postMessage` 传递，大数据量需用 Transferable Objects

3. **Worker 生命周期**

   - 主线程可随时 terminate，避免内存泄漏

4. **浏览器兼容性**

   - 主流浏览器支持 Dedicated Worker，旧版 IE 支持有限

---

## 🧠 六、总结

- **Web Worker** = 后台线程运行 JS → 不阻塞 UI
- **Dedicated Worker** 最常用，适合单页面计算密集任务
- **Shared Worker / Service Worker** 用于跨窗口共享或网络拦截
- **关键优化点**：

  - 使用 Transferable Objects 处理大数据
  - 尽量拆分耗时任务，避免主线程阻塞
  - 合理 terminate 释放资源
