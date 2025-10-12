# 大规模并发

下面把**前端在面对大规模并发（大量请求、海量用户交互、海量 DOM/数据更新）**时常用的手段按类别整理给你——每一类都配上要点、应用场景和简短示例（若适用），方便落地使用。

## 一、减少并发产生的请求 / 流量（入口层面）

- **防抖（debounce） / 节流（throttle）**：输入、滚动、窗口 resize 等频繁事件。

  - 场景：搜索输入联想、滚动加载触发。
  - 简单示例（防抖）：

  ```js
  function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
  ```

- **合并/批量请求（batching）**：把多次小请求合并成一个接口。

  - 场景：列表中每行单独请求用户数据 → 合并成一次批量查询。

- **请求聚合 / 延迟合并（micro-batching）**：短时间窗口内收集多个操作合并发送。
- **去重（dedupe）**：并发相同请求只发送一次（缓存 pending Promise）。

## 二、限制并发数量 & 排队（客户端流控）

- **并发池 / 限流（semaphore / p-limit）**：控制同时进行的网络请求数量，保护浏览器和后端。

  - 示例：用 `p-limit`，或自实现并发队列：

  ```js
  async function limitPool(tasks, concurrency = 5) {
    const res = [];
    const pool = [];
    for (const task of tasks) {
      const p = Promise.resolve().then(() => task());
      res.push(p);
      pool.push(p);
      if (pool.length >= concurrency)
        await Promise.race(pool).then(() => {
          pool.splice(
            pool.findIndex((x) => x === p),
            1
          );
        });
    }
    return Promise.all(res);
  }
  ```

- **优先级队列**：关键任务优先（例如首屏资源优先加载）。

## 三、取消/中断与回退（Abort / Retry）

- **AbortController**：可中断不再需要的 fetch/XHR 请求（节省资源）。

  ```js
  const ac = new AbortController();
  fetch("/api", { signal: ac.signal });
  // 取消
  ac.abort();
  ```

- **退避重试（exponential backoff + jitter）**：对短暂失败进行重试，避免雪崩。
- **熔断/降级（circuit breaker / graceful fallback）**：后端不可用时客户端降级表现（提示/本地缓存数据）而不是无限重试。

## 四、前端并发计算/渲染优化（CPU/DOM 层面）

- **Web Workers / Shared Workers / OffscreenCanvas**：把耗时计算/渲染移到线程，避免主线程卡顿。

  - 场景：大数据处理、图表渲染、图片处理、PDF 解析。

- **虚拟化列表（windowing）**：只渲染可视区域 DOM（如 `react-window`、`react-virtualized`）。

  - 场景：百万级列表。

- **请求 IdleCallback / requestAnimationFrame**：低优先级任务在空闲时间执行或与渲染周期配合。
- **批量 DOM 更新（batching）**：合并多次状态更新（React 已有 batching，但对非框架操作需注意）。
- **CSS containment / will-change / hardware acceleration**：减少重排重绘范围。

## 五、缓存与离线机制（减少重复请求）

- **HTTP 缓存（Cache-Control、ETag）**：利用浏览器和 CDN 的缓存策略。
- **Service Worker 缓存策略（Cache-first / Network-first / Stale-while-revalidate）**：控制离线与并发加载行为。
- **本地存储 / IndexedDB 缓存 + 同步队列**：减少频繁网络请求，支持离线队列（例如离线提交队列）。
- **预取/预加载（prefetch/prelude/rel=preload）**：为可能的后续请求做准备，但要慎用，避免浪费带宽。

## 六、实时连接的并发控制（WebSocket / SSE）

- **连接复用与心跳**：对大量客户端管理连接时要控制心跳频率、消息分发策略。
- **消息聚合 / 批量推送**：后端合并推送以减少消息吞吐。
- **订阅粒度控制**：客户端订阅更精细的主题，避免订阅过多冗余数据。
- **退步到轮询**：在 WebSocket 限制下可选择长轮询或短轮询作为后备方案。

## 七、传输层与协议优化

- **HTTP/2 或 HTTP/3**：支持请求复用、头压缩、多路复用，减少连接数和延迟（需后端/CDN 支持）。
- **压缩（gzip/br/deflate）与二进制传输（protobuf/msgpack）**：减小 payload。
- **分块传输 / 流（fetch streams / ReadableStream）**：流式处理大量数据，避免一次性占用内存。
- **分页与增量加载（cursor / cursor-based pagination）**：避免一次拉取全部数据。

## 八、用户体验（在高并发下的感知优化）

- **Skeleton / 占位加载**：降低感知延迟，比空白加载更好。
- **乐观更新 + 补偿/回滚**：用户操作立即反馈，后端确认后补正或回滚。
- **请求优先级与快速失败提示**：对长耗时操作给出进度或可取消选项。
- **渐进增强与功能降级**：网络拥堵或设备差时，自动简化体验（低质量图片、简化动画）。

## 九、客户端策略与架构实践

- **Rate limiting（客户端）**：在客户端做速率控制，防止突发请求洪峰。
- **幂等设计 + 唯一操作 ID**：重复请求不会导致副作用，便于重试。
- **队列持久化（IndexedDB）**：重要操作队列化并持久化，断网恢复发送。
- **拆分/微前端 & SSR**：首屏 SSR 减少客户端并发渲染压力；按路由拆包减少下载并发。

## 十、监控、测试与后端配合

- **监控（RUM、APM）**：收集前端请求失败率、时延、主线程阻塞等，及时发现瓶颈。
- **压测/容量评估**：通过负载测试（前端模拟大量并发用户）验证整体系统表现。
- **和后端协作**：后端提供批量接口、分页、限流反馈（429）和降级策略更高效。

---

## 小结（实战建议）

1. **先从“减少请求”做起**：防抖/节流 + 合并请求 + 本地/HTTP 缓存。
2. **对并发请求做池化/限流**：保护浏览器和后端。
3. **将 CPU 密集型任务移到 Web Worker**，UI 用虚拟化减少 DOM 开销。
4. **做好取消（AbortController）与重试策略**，并配合后端实现熔断/降级。
5. **测并监控**：在真实负载下验证并调整参数（并发数、批次时间窗口等）。

如果你愿意，我可以：

- 根据你的具体场景（例如“列表渲染百万条+每条需请求用户信息”或“直播弹幕高并发写入”）给出**一份可执行的方案**和示例代码；或
- 为你写一个**简单的并发池/批量器 + Abort 支持**的实现库示例。

告诉我你关心的具体场景，我就直接给出对应的代码与参数建议。

# 大文件上传

非常好的问题 👍。**“大文件上传”** 是前端性能与可靠性非常关键的一环。随着视频、模型文件、工程包等体积越来越大（上百 MB 到数 GB），需要对上传过程做一系列优化来保证体验与成功率。

下面我系统地总结下常见的 **大文件上传处理方案 + 优化手段**：

---

## 🧩 一、常见问题与挑战

1. **文件体积过大**：直接上传容易超时、占用带宽、触发服务端限制。
2. **网络不稳定**：上传中断需要能断点续传。
3. **服务器压力大**：并发请求多时，必须分片和限流。
4. **安全性问题**：需要防止恶意上传、校验完整性。
5. **用户体验差**：上传时间长、无进度反馈。

---

## 🚀 二、核心处理思路

### 1️⃣ 分片上传（Chunk Upload）

把大文件切分成多个小块（如每块 5~10MB），**并行上传**到服务器。

**前端实现：**

```js
function sliceFile(file, chunkSize = 5 * 1024 * 1024) {
  const chunks = [];
  let start = 0;
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }
  return chunks;
}
```

**后端配合：**

- 接收每个分片并保存（带分片索引、hash）。
- 全部分片上传完成后进行**合并**。
- 可选：支持断点续传（根据已上传分片跳过上传）。

---

### 2️⃣ 断点续传（Resume Upload）

核心：记录已上传分片，支持**中断后重新上传未完成部分**。

**实现方式：**

- 前端计算文件的唯一标识（如 `fileHash = md5(fileName + size + lastModified)`）。
- 上传前向后端请求已上传的分片列表。
- 跳过重复分片，只上传剩余部分。

> ✅ 优点：支持网络波动、浏览器崩溃恢复。
> ⚙️ 常见实现：基于 localStorage + 后端分片记录。

---

### 3️⃣ 秒传（Instant Upload / 秒级校验）

如果服务器上已经存在相同文件（通过 hash 校验），直接返回成功，无需上传。

**步骤：**

1. 前端计算文件 hash（MD5 或 SHA-256）。
2. 上传前发送 hash 到后端校验。
3. 若服务器已有该文件，直接跳过上传。

> ⚙️ 可结合断点续传共享分片（如相同分片 hash 可跳过）。

---

### 4️⃣ 并发上传与并发控制

- 一次性上传过多分片会占用过多带宽。
- 建议控制并发数量（如 `Promise.allSettled` + 限流）。

```js
import pLimit from "p-limit";
const limit = pLimit(5); // 限制5个并发
await Promise.all(chunks.map((chunk, i) => limit(() => uploadChunk(chunk, i))));
```

---

### 5️⃣ 上传进度与用户反馈

- 使用 `XMLHttpRequest.upload.onprogress` 或 `fetch + stream`。
- 实时展示已上传大小、百分比。
- 可以结合全局状态（如 Zustand / Redux）显示进度条。

---

### 6️⃣ 合并接口（Merge API）

所有分片上传完成后：

- 前端发送 `/merge` 请求通知后端。
- 后端按分片顺序合并为完整文件。

---

### 7️⃣ 大文件校验与完整性验证

- 每个分片可计算 MD5 校验码。
- 合并后后端再次计算整体 hash，与前端传入 hash 对比，确保文件未损坏。

---

## ⚙️ 三、常用优化手段总结表

| 优化目标   | 手段            | 说明                       |
| ---------- | --------------- | -------------------------- |
| 上传性能   | 分片上传        | 多线程上传小文件块         |
| 网络容错   | 断点续传        | 失败重传、断线恢复         |
| 服务器压力 | 并发控制 + 限流 | 保持上传流量平稳           |
| 重复上传   | 秒传            | 基于文件 Hash 跳过重复文件 |
| 上传体验   | 实时进度条      | 使用 onProgress 反馈       |
| 文件安全   | 文件校验        | Hash 验证完整性            |
| 资源占用   | 临时分片清理    | 上传后清除无效分片         |

---

## 🧠 四、进阶方案

### 1️⃣ 上传加速（直传到云）

- 前端请求上传凭证（如 AWS S3、阿里 OSS、七牛云）。
- 前端直传到对象存储。
- 服务器仅做签名授权、合并通知。

> 🚀 优点：减少后端带宽和压力。

### 2️⃣ Web Workers 计算 Hash

避免主线程卡顿，用 worker 来异步计算大文件 hash。

### 3️⃣ Streaming Upload（可选）

通过 `ReadableStream` 边读边传，可减少内存占用（浏览器兼容较新）。

---

## 💡 五、常用开源方案

| 名称                                                          | 特点                               |
| ------------------------------------------------------------- | ---------------------------------- |
| [tus.io](https://tus.io/)                                     | 标准化断点续传协议                 |
| [uppy](https://uppy.io/)                                      | 强大的上传库，支持分片/断点/云直传 |
| [Resumable.js](https://github.com/23/resumable.js)            | 轻量分片上传库                     |
| [FineUploader](https://github.com/FineUploader/fine-uploader) | 老牌上传解决方案                   |
| [Aliyun OSS SDK / AWS SDK]                                    | 云直传解决方案                     |

---

## ✅ 推荐组合（前端实践）

如果你自己实现上传模块，可这样设计：

```js
// 上传流程
1️⃣ 计算文件hash（web worker）
2️⃣ 请求后端：检查文件是否存在（秒传）
3️⃣ 如果不存在：
   - 切分文件为分片
   - 查询已上传分片（断点续传）
   - 并发上传剩余分片
4️⃣ 所有分片完成后调用 /merge 接口
5️⃣ 展示进度条与完成提示
```

---

是否希望我帮你给出一个 **完整的前端分片上传 + 断点续传实现示例（含服务端伪代码）**？
那样可以直接用于实际项目（支持大文件、断点续传、秒传等）。

# WebWorker 处理切片

✅ 非常好的问题！
答案是：**在处理较大文件时（通常 >100MB），非常推荐使用 Web Worker 来做文件切片和 hash 计算。**

我们详细分析下原因 👇：

---

## 🧩 一、为什么切片操作会卡顿？

当你在主线程中读取和切割大文件时，比如：

```js
const chunks = [];
let start = 0;
while (start < file.size) {
  const end = Math.min(start + chunkSize, file.size);
  chunks.push(file.slice(start, end));
  start = end;
}
```

虽然 `file.slice()` 是相对轻量的操作，但在以下几种情况下仍可能导致明显卡顿：

1. **文件非常大（几百 MB~GB 级）**。
   文件对象的 I/O 操作会占用主线程时间，导致 UI 卡顿。
2. **你还要计算文件 hash（比如 MD5/SHA-256）**。
   计算 hash 属于 CPU 密集任务，会阻塞主线程的渲染。
3. **同时还有上传进度、交互动画、按钮响应**。
   主线程忙于计算，就无法响应用户操作。

> ⚠️ 用户体验问题：浏览器会出现“页面未响应”或卡顿现象。

---

## 🧠 二、使用 Web Worker 的优势

| 对比项   | 主线程处理     | Web Worker 处理            |
| -------- | -------------- | -------------------------- |
| 性能     | 可能阻塞 UI    | 不阻塞 UI                  |
| 用户体验 | 拖拽或进度卡顿 | 流畅                       |
| 并行能力 | 单线程         | 多线程                     |
| 扩展性   | 较差           | 可扩展为多 worker 并行计算 |

**核心思想：**
Web Worker 在独立线程中执行切片、hash、预处理等任务，
主线程只负责 UI 反馈和控制逻辑，两者通过 `postMessage()` 通信。

---

## ⚙️ 三、典型架构示意

```text
[主线程]                [Worker 线程]
  ↓                           ↓
文件选择 → 创建 worker  →   接收 file 对象
          ↘ postMessage(file)
              → 切片 + hash 计算
              → postMessage({ chunks, fileHash })
  ↑                           ↑
  ← 监听 message ←────────────┘
```

---

## 🧩 四、简单实现示例

### 1️⃣ 创建 worker 文件（`fileWorker.js`）

```js
// fileWorker.js
self.onmessage = async (e) => {
  const { file, chunkSize } = e.data;
  const chunks = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }

  // 可选：计算 hash
  const hash = await computeHash(chunks);
  self.postMessage({ chunks, hash });
};

async function computeHash(chunks) {
  const spark = new self.SparkMD5.ArrayBuffer();
  for (const chunk of chunks) {
    const buffer = await chunk.arrayBuffer();
    spark.append(buffer);
  }
  return spark.end();
}
```

---

### 2️⃣ 主线程使用

```js
const worker = new Worker(new URL("./fileWorker.js", import.meta.url));

worker.postMessage({ file, chunkSize: 5 * 1024 * 1024 });

worker.onmessage = (e) => {
  const { chunks, hash } = e.data;
  console.log("切片数量:", chunks.length, "hash:", hash);
  // 进入上传逻辑...
};
```

---

## 🚀 五、进一步优化

### ✅ 1. **多 Worker 并行处理**

如果文件极大（>1GB），可以按文件大小动态拆分任务：

- 每个 worker 负责部分分片；
- 主线程汇总结果；
- 计算整体 hash。

### ✅ 2. **增量 hash（Streaming Hash）**

对每个分片计算部分 hash，边读边算，可减少内存峰值。

### ✅ 3. **WebAssembly + Worker**

使用 WebAssembly（如 `crypto-js` 或 `hash-wasm`）在 worker 内计算 hash，可提升速度 3~5 倍。

---

## ⚖️ 六、何时需要 Web Worker？

| 文件大小     | 是否建议使用 Worker | 原因                   |
| ------------ | ------------------- | ---------------------- |
| < 50MB       | ❌ 不必             | 切片快，用户感知不明显 |
| 50MB ~ 500MB | ✅ 建议             | 防止卡顿，提升体验     |
| > 500MB      | ✅ 强烈推荐         | hash 计算非常耗时      |
| > 1GB        | ✅ 必须             | 主线程无法承受         |

---

## 🧩 七、总结

| 任务           | 是否适合放在 Worker               |
| -------------- | --------------------------------- |
| 文件切片       | ✅（文件大时）                    |
| 文件 hash 计算 | ✅ 强烈推荐                       |
| 分片上传       | ❌ 不需要（主线程管理并发更方便） |
| 断点续传管理   | ❌ 不适合放在 worker              |
| 压缩 / 转码    | ✅（非常耗 CPU）                  |

---

✅ **结论：**

> 小文件（几十 MB）直接切片无所谓。
> 但对于中大型文件上传（100MB+），**用 Web Worker 切片 + hash 是最佳实践**，
> 可显著提高性能与用户体验。

# indexDb 切片存储

非常好的深入问题 👏，说明你已经进入到**真正的大文件上传工程实践层面**了。

你问的重点是：

> “切片文件应该保存到哪里，才能在刷新页面时不丢失？”

答案要分 **“文件数据”** 和 **“切片状态”** 两个层面来看 👇

---

## 🧩 一、前提：浏览器刷新是一个「硬重置」

一旦刷新，内存中的任何 JS 变量都会被清空，包括：

- 已切好的 `Blob` 切片对象；
- 计算好的文件 hash；
- 上传进度状态。

因此，要“刷新后继续上传”，我们必须：

1. **持久化保存状态（哪一部分已经上传）**；
2. **能够重新定位到原始文件**。

---

## ⚙️ 二、浏览器端可用的持久化存储方式对比

| 方案                    | 是否可存文件内容    | 可存容量       | 适用场景              | 刷新后可恢复       |
| ----------------------- | ------------------- | -------------- | --------------------- | ------------------ |
| `localStorage`          | ❌ 仅字符串         | ~5MB           | 保存上传状态/分片列表 | ✅                 |
| `IndexedDB`             | ✅ 可存 Blob/File   | 数百 MB~几 GB  | 保存切片数据          | ✅                 |
| `FileSystem Access API` | ✅ 直接访问磁盘文件 | 取决于用户授权 | 桌面端文件持久化      | ✅（但需用户授权） |
| 内存变量                | ❌                  | -              | 临时缓存              | ❌ 刷新即丢        |

---

## 🧠 三、正确做法：数据与状态分离

### 🧩 1️⃣ 切片文件本身 —— 不需要保存（除特殊情况）

通常切片数据（`Blob`）是从 `File` 对象读取的。
刷新后即便丢失，只要**用户重新选择相同文件**，就能重新生成切片。
→ **不必永久保存 Blob 切片本身**。

> ✅ 原因：文件本身通常在用户磁盘上，重新选择并计算 hash 即可恢复。

---

### 🧩 2️⃣ 上传进度 / 已上传分片列表 —— 必须保存！

这是关键点。
刷新后要“断点续传”，你只需要知道哪些分片已经上传。

可以保存这些状态到 `localStorage` 或 `IndexedDB`：

```ts
interface UploadRecord {
  fileHash: string;
  uploadedChunks: number[]; // 已上传分片索引
  totalChunks: number;
  fileName: string;
  lastModified: number;
}
```

存储：

```js
localStorage.setItem(`upload_${fileHash}`, JSON.stringify(uploadRecord));
```

恢复：

```js
const record = localStorage.getItem(`upload_${fileHash}`);
if (record) {
  const { uploadedChunks } = JSON.parse(record);
  // 仅上传未完成的分片
}
```

---

## 🧱 四、如果你确实想保存「切片文件数据」

这在特殊场景下有意义，比如：

- 用户选择文件 → 切片后 → 关闭页面 → 下次打开时**继续上传**，而不重新选文件。

可用 `IndexedDB` 存储 `Blob` 数据：

```js
const db = await indexedDB.open("uploadDB", 1);
const tx = db.transaction("chunks", "readwrite");
tx.objectStore("chunks").put({ fileHash, index, chunkBlob });
```

取出：

```js
const chunk = await tx.objectStore("chunks").get([fileHash, index]);
```

> ⚠️ 注意：
>
> - 不同浏览器对 IndexedDB 大文件支持差异较大（Safari 较差）。
> - 超过 500MB 容易被用户拒绝或触发清理策略。
> - 实际项目中，**更推荐重新读取原文件，而非持久化 Blob。**

---

## 🧠 五、推荐最佳实践：状态持久化 + 文件重选复用

### 上传流程示意

```text
1️⃣ 用户选择文件 → 计算 fileHash
2️⃣ 检查 localStorage 是否有 upload_{fileHash} 记录
    ├─ 有 → 获取已上传分片列表
    ├─ 无 → 新建记录
3️⃣ 切片上传时实时更新 localStorage 状态
4️⃣ 刷新后用户再次选择同一文件
    → 重新计算 hash
    → 从 localStorage 恢复进度
    → 继续未上传分片
```

---

## 💡 六、前后端配合要点

服务端需支持：

- `check` 接口 → 检查文件/分片是否已上传；
- `upload` 接口 → 上传单个分片；
- `merge` 接口 → 合并所有分片；
- （可选）`verify` → 校验 hash 完整性。

前端状态恢复逻辑：

- 使用 `fileHash` 作为唯一键；
- 刷新后重新上传只缺失分片；
- 上传成功清理 `localStorage`。

---

## ✅ 七、总结

| 内容            | 存储建议                 | 是否能持久化 | 备注             |
| --------------- | ------------------------ | ------------ | ---------------- |
| 文件本身        | 用户磁盘上               | ✅           | 重新选择即可     |
| 切片 Blob       | IndexedDB（仅必要时）    | ✅           | 不推荐长期存储   |
| 上传进度        | localStorage             | ✅           | 必须持久化       |
| 分片 hash、状态 | localStorage             | ✅           | 用 fileHash 关联 |
| 上传任务元信息  | localStorage / IndexedDB | ✅           | 用于恢复任务     |

---

📘 **结论：**

> 一般不需要保存切片文件，只需保存「文件 hash + 已上传分片状态」即可。
> 这样在刷新后用户重新选择同一文件时，可以立即断点续传，且不会浪费存储空间。

---

是否希望我帮你写一个完整的实现模板（含 IndexedDB 断点续传 + 刷新恢复逻辑 + 上传状态管理）？
可直接接入 React / 原生 JS 使用。

# 网页截图

非常棒的问题 👍
“网页截图”在前端其实是一个非常常见又复杂的需求，因为你要截取的“网页”可能是：

- 当前视口（屏幕看到的部分）
- 整个网页（超出屏幕滚动区域）
- 特定 DOM 元素
- 甚至是跨域 iframe 或视频画面

不同场景需要不同方案。下面我来系统讲清楚前端实现网页截图的 **所有主流方案 + 优缺点对比 + 实践建议** 👇

---

## 🧩 一、常见截图实现方案总览

| 类型                             | 工具/技术                               | 是否跨平台（浏览器/Node） | 能否截全页 | 跨域支持     | 是否能截图视频/iframe |
| -------------------------------- | --------------------------------------- | ------------------------- | ---------- | ------------ | --------------------- |
| 前端 Canvas 渲染                 | html2canvas / dom-to-image              | ✅ 浏览器端               | ✅（部分） | ❌           | ❌                    |
| 浏览器 API                       | `captureStream()` / `getDisplayMedia()` | ✅                        | ✅         | ✅（受限）   | ✅                    |
| Puppeteer / Playwright           | Node 服务端                             | ✅ Node 环境              | ✅         | ✅           | ✅                    |
| Chrome DevTools Protocol (CDP)   | Node 环境                               | ✅                        | ✅         | ✅           | ✅                    |
| 插件扩展（Chrome Extension）     | 浏览器扩展                              | ✅                        | ✅         | ✅（权限高） | ✅                    |
| 服务端渲染（WebView / Headless） | SSR 或自建截图服务                      | ✅                        | ✅         | ✅           | ✅                    |

---

## 🧠 二、前端纯浏览器方案

### ✅ 1️⃣ **html2canvas**

最常见的网页截图库（JS 实现，无需后端）。

**原理：**
将 DOM 树解析为 Canvas 图像，通过 Canvas API 渲染为截图。

**使用示例：**

```js
import html2canvas from "html2canvas";

const element = document.querySelector("#capture");
html2canvas(element, {
  useCORS: true, // 允许跨域图片
  backgroundColor: "#fff",
}).then((canvas) => {
  const dataURL = canvas.toDataURL("image/png");
  downloadImage(dataURL, "screenshot.png");
});
```

**优点：**

- 完全前端实现；
- 无需额外依赖；
- 可选截取部分元素；
- 支持 PNG / JPEG 导出。

**缺点：**

- **跨域图片/字体** 会显示为黑块（需 `useCORS` 且图片服务器支持 CORS）。
- 不支持 **视频 / iframe / 伪元素**。
- 对复杂样式（阴影、滤镜、混合模式）兼容性一般。
- 对大页面性能差（内存消耗大）。

---

### ✅ 2️⃣ **dom-to-image / html-to-image**

类似 `html2canvas`，但更轻量、支持更现代的 CSS 特性。

**差异点：**

- 支持 `filter`, `border-radius`, `transform` 等更多样式；
- 更容易导出多种格式（svg/png/jpeg/blob）。

```js
import { toPng } from "html-to-image";

toPng(document.getElementById("capture")).then((dataUrl) => {
  const link = document.createElement("a");
  link.download = "screenshot.png";
  link.href = dataUrl;
  link.click();
});
```

**优点：**

- 效果更精细；
- 渲染速度比 html2canvas 快；
- API 更简洁。

**缺点：**

- 同样无法跨域截图；
- 对非常大的 DOM 会爆内存。

---

### ✅ 3️⃣ **Canvas + drawImage 自己实现**

如果你只想截图某个 Canvas、图片、视频帧，可以直接用原生 Canvas。

```js
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
ctx.drawImage(videoElement, 0, 0, width, height);
const img = canvas.toDataURL("image/png");
```

**优点：**

- 性能极高；
- 可精确控制截取内容；
- 可截图视频帧（比如录屏、视频封面）。

**缺点：**

- 仅限可绘制的元素（非 HTML DOM）；
- 不能直接截取整个网页结构。

---

## 🧰 三、浏览器录屏/截图 API

### ✅ 1️⃣ **getDisplayMedia()**

浏览器提供的 **屏幕捕获 API**。

**示例：**

```js
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
const track = stream.getVideoTracks()[0];
const imageCapture = new ImageCapture(track);
const bitmap = await imageCapture.grabFrame();
track.stop();

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
ctx.drawImage(bitmap, 0, 0);
const img = canvas.toDataURL("image/png");
```

**优点：**

- 真正意义上的“屏幕截图”（包括视频、跨域 iframe）。
- 可截取整个屏幕、浏览器标签页或应用窗口。
- 权限安全（浏览器会提示选择来源）。

**缺点：**

- 需要用户授权；
- 无法静默截图；
- 不支持在移动端使用；
- 无法自动化（需人工选择窗口）。

> ✅ 如果你要“用户手动截图”或“录屏 + 截图”，这是最强方案。

---

## ⚙️ 四、Node 端截图方案（后端渲染）

### ✅ 1️⃣ Puppeteer（或 Playwright）

Headless Chrome 提供的 API，可**无界面渲染网页并截图**。

**示例：**

```js
import puppeteer from "puppeteer";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("https://example.com", { waitUntil: "networkidle0" });
await page.screenshot({ path: "page.png", fullPage: true });
await browser.close();
```

**优点：**

- 支持整页截图（不限视口）；
- 可渲染复杂页面、动画；
- 可执行 JS、登录后截图；
- 稳定、自动化。

**缺点：**

- 需后端 Node 环境；
- 截图速度受网络影响；
- 无法在纯前端使用。

> 💡 常见用法：生成网页缩略图、导出长图报告、生成 PDF。

---

## 🔒 五、浏览器扩展 / 插件方案

如果你能开发 Chrome 扩展，就能利用更高权限的 API：

- `chrome.tabs.captureVisibleTab()`
- `chrome.tabs.captureTab()`

这些可以直接截取：

- 当前网页；
- 整页（自动滚动截图）；
- iframe、canvas、视频等。

> ✅ 优点：跨域无问题；
> ❌ 缺点：必须是扩展环境（普通网页不能调用）。

---

## 🧩 六、服务端截图方案

当你不想让用户端承担截图负担时，可以做“截图服务”：

比如：

- 使用 Puppeteer 启动 Headless Chrome；
- 传入 URL；
- 后端生成截图（PNG/JPEG）并返回。

> 应用场景：分享缩略图、生成长图报告、静态站点预览。

---

## 🧠 七、总结推荐

| 需求                             | 推荐方案                             | 说明           |
| -------------------------------- | ------------------------------------ | -------------- |
| 截取某个 DOM 元素                | `html-to-image` / `html2canvas`      | 最简单         |
| 截取整个网页                     | `html2canvas` + 滚动拼接 / Puppeteer | 前后端都行     |
| 截取视频画面                     | `canvas.drawImage(video)`            | 高性能         |
| 用户手动选择屏幕截图             | `getDisplayMedia()`                  | 原生安全方案   |
| 稳定生成网页快照（如报告、海报） | Puppeteer / Playwright               | 专业方案       |
| 跨域网页截图                     | Puppeteer / 扩展 API                 | 纯前端无法实现 |

---

## 💡 八、进阶优化技巧

1. **滚动拼接截图（前端）**
   如果要截整页，可以：

   - 用 `window.scrollTo()` 循环滚动；
   - 每次用 `html2canvas` 截视口；
   - 最后在 Canvas 上拼接所有截图。

2. **减少内存占用**
   大页面截图前可以：

   - 临时隐藏动画元素；
   - 限制 DOM 数量；
   - 降低分辨率（`scale: 0.8`）。

3. **图片导出优化**
   可选择：

   - PNG（无损、较大）；
   - JPEG（有损、较小）；
   - WebP（高效压缩）。

---

✅ **总结一句话：**

> 普通网页截图用 `html-to-image`；
> 实际屏幕截图用 `getDisplayMedia`；
> 生成报告或全页截图用 Puppeteer。

---

是否希望我帮你整理一个
👉 “纯前端网页截图方案（基于 html-to-image + 可导出 PNG）” 的完整可复用封装示例？
包括：指定 DOM 截图、全页拼接、自动下载功能。

# 移动端适配

非常好的问题 👍，**移动端适配**（Mobile Responsive / Adaptive Design）是前端开发的核心问题之一。
根据项目规模、技术栈和目标设备，常见的适配方案大致可以分为以下几类 👇：

---

## 🧩 一、总体目标

移动端适配的核心目标是：

> ✅ 在不同尺寸、分辨率、像素密度（DPR）的设备上，保证布局合理、文字清晰、交互自然。

---

## 🧱 二、常见适配方案分类

| 方案                                           | 关键思路                                                                      | 优点                        | 缺点                         | 适用场景                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------- | ---------------------------- | ------------------------------ |
| **1. 媒体查询 (Media Query)**                  | 使用 CSS 的 `@media` 根据宽度切换样式                                         | 简单、原生支持              | 手动维护多套规则，难统一比例 | 响应式网站、Web H5             |
| **2. 百分比布局 (%)**                          | 使用相对父元素宽高的百分比                                                    | 自适应伸缩                  | 计算复杂，嵌套多时难控       | 简单页面、流式布局             |
| **3. rem 适配 (动态根字体)**                   | 按设备宽度动态设置 `html { font-size }`，使用 `rem` 做单位                    | 统一比例缩放、兼容性好      | 初学需配置、部分精度问题     | 常见于移动 Web / Vue / React   |
| **4. viewport 缩放 (meta + px)**               | 设置 `<meta name="viewport" content="width=device-width, initial-scale=1.0">` | 兼容好                      | 对高清屏需额外适配 DPR       | 通用网页                       |
| **5. vw/vh 适配**                              | 使用 `vw`、`vh` 作为单位（1vw = 1%视口宽）                                    | 精确按视口比例缩放、无需 JS | 老旧浏览器支持差             | 移动 H5、现代框架              |
| **6. Flex/Grid 弹性布局**                      | 元素自动分配空间                                                              | 现代布局首选，响应性强      | IE 不兼容                    | 所有现代项目                   |
| **7. 像素比适配 (DPR / DPR Scaling)**          | 根据 `window.devicePixelRatio` 缩放 canvas、图片资源                          | 提高清晰度                  | 实现复杂、性能要求高         | 游戏、Canvas、高清图展示       |
| **8. 多端编译适配 (Taro/UniApp/React Native)** | 编译为原生小程序或原生 App                                                    | 体验一致                    | 需依赖框架生态               | 多端统一（Web + 小程序 + App） |

---

## 📏 三、主流两种核心技术方案对比

### 🔹 rem 方案（以设计稿 375px 为例）

#### 步骤：

1. 设置 viewport：

   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```

2. 在 JS 中动态设置根字体：

   ```js
   const baseSize = 100;
   function setRem() {
     const scale = document.documentElement.clientWidth / 375;
     document.documentElement.style.fontSize = baseSize * scale + "px";
   }
   window.onresize = setRem;
   setRem();
   ```

3. CSS 使用 rem 单位：

   ```css
   .btn {
     width: 2rem; /* 约等于 200px @375px 设计稿 */
   }
   ```

> ✅ 优点：比例自适应，简单、兼容好。
> 🔻 缺点：依赖 JS 设置，可能在极端设备上略失真。

---

### 🔹 vw 方案（以设计稿 375px 为例）

#### 设置：

```css
html {
  font-size: calc(100vw / 3.75); /* 1vw = 3.75px */
}
.btn {
  width: 50vw; /* 宽度占屏幕一半 */
}
```

> ✅ 优点：无需 JS、纯 CSS、自适应所有设备。
> 🔻 缺点：老旧安卓或 iOS <10 浏览器支持不完美。

---

## 📱 四、常用优化技巧

| 技术                               | 作用                   |
| ---------------------------------- | ---------------------- |
| `meta viewport` 设置               | 限制缩放、控制布局宽度 |
| `box-sizing: border-box;`          | 统一盒模型             |
| `image-set()`                      | 适配不同 DPR 图像      |
| `window.devicePixelRatio`          | 控制 Canvas 缩放防模糊 |
| `flex` + `min-width`               | 防止文字溢出或布局崩溃 |
| Tailwind 的 `sm:` `md:` `lg:`      | 简化响应式书写         |
| PostCSS + `postcss-px-to-viewport` | 自动把 px 转 vw/vh/rem |

---

## 🧠 五、推荐方案组合（实际项目中）

| 类型                 | 推荐方案                            | 补充           |
| -------------------- | ----------------------------------- | -------------- |
| 移动 H5              | ✅ `vw/vh + Flex + viewport meta`   | 最现代、纯 CSS |
| 混合 App (WebView)   | ✅ `rem + viewport meta`            | 兼容性好       |
| Canvas / 游戏        | ✅ DPR 缩放 + requestAnimationFrame | 保证高清       |
| 跨端（小程序 + Web） | ✅ Taro / UniApp / React Native     | 一套代码多端   |

---

是否需要我给出一个**示例：rem 与 vw 的完整对比 Demo（含代码）**？
这样你能直观看到布局在不同设备下的缩放效果。

# 修改 npm 包

- npm patch
- npm package

# npm 私服

非常棒 👍，你提到的 **npm 私服（Private npm Registry）** 是前端工程化中非常常见的基础设施，用来 **存储、管理、发布公司或团队内部的 npm 包**。

下面我们来系统地讲一下：

---

## 🧩 一、什么是 npm 私服

**npm 私服（Private npm Registry）** 本质上就是一个你自己部署的 **npm 仓库服务**，
用来替代或代理官方的 [https://registry.npmjs.org](https://registry.npmjs.org)。

它的作用包括：

- ✅ **缓存 npm 官方包**，加快安装速度；
- ✅ **托管私有包**（不发布到公网）；
- ✅ **控制发布权限与访问权限**；
- ✅ **内网可用**（企业内部环境）；
- ✅ **统一依赖源**，保证构建稳定。

---

## 🏗️ 二、常见实现方案

| 方案                                   | 特点               | 是否开源         | 优点                               | 缺点               |
| -------------------------------------- | ------------------ | ---------------- | ---------------------------------- | ------------------ |
| **Verdaccio**                          | 轻量、Node.js 实现 | ✅ 开源          | 部署简单、社区活跃                 | 不适合超大规模     |
| **Nexus Repository Manager**           | 专业企业级方案     | ✅ 免费版/付费版 | 支持 npm、maven、docker 等多种格式 | 较重、Java 环境    |
| **JFrog Artifactory**                  | 商业级仓库         | ✅ 免费版/付费版 | 功能强大、支持多语言包管理         | 资源占用大         |
| **AWS CodeArtifact / GitHub Packages** | 云托管私服         | ❌ 商业服务      | 无需运维、云集成方便               | 成本高、访问需配置 |
| **npm Enterprise**                     | 官方企业版         | ❌ 付费          | 官方维护、安全合规                 | 价格高昂           |

> 🧠 **Verdaccio** 是前端团队最常用的自建私服方案。

---

## ⚙️ 三、Verdaccio 私服搭建流程（推荐）

### 1️⃣ 安装 Verdaccio

```bash
npm install -g verdaccio
```

### 2️⃣ 启动服务

```bash
verdaccio
```

默认会在本地启动 `http://localhost:4873`

### 3️⃣ 配置 npm 使用私服

```bash
npm set registry http://localhost:4873/
```

验证：

```bash
npm whoami
```

---

### 4️⃣ 登录私服

```bash
npm adduser --registry http://localhost:4873/
```

输入用户名 / 密码 / 邮箱后即可登录。

---

### 5️⃣ 发布私有包

假设你在项目目录中有 `package.json`：

```bash
npm publish --registry http://localhost:4873/
```

发布后可通过：

```bash
npm install my-private-package --registry http://localhost:4873/
```

来安装。

---

### 6️⃣ 配置代理上游源（缓存 npm 官方包）

Verdaccio 的配置文件在：

```bash
~/.config/verdaccio/config.yaml
```

修改部分如下：

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  "@*/*":
    access: $all
    publish: $authenticated
    proxy: npmjs
  "**":
    access: $all
    publish: $authenticated
    proxy: npmjs
```

> 这样你的私服既能托管私有包，又能代理 npm 官方源。

---

## 🧠 四、企业常见私服架构

```
┌────────────────────┐
│  官方 npm 源       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Verdaccio / Nexus  │ ← 内部私有包
│ (缓存 + 私包管理)   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 开发者 / CI 构建机 │ → npm install / npm publish
└────────────────────┘
```

---

## 🔐 五、安全与权限控制

Verdaccio 支持：

- 用户登录认证（支持 `htpasswd`、LDAP、GitHub OAuth）；
- 按包名或 scope 限定访问权限；
- 可配置 read-only 用户；
- 可通过反向代理（如 Nginx）加 HTTPS。

例如：

```yaml
packages:
  "@company/*":
    access: $authenticated
    publish: admin
  "private-lib":
    access: user1 user2
    publish: admin
```

---

## 🚀 六、优化与实践建议

| 方向              | 建议                                            |
| ----------------- | ----------------------------------------------- |
| 🔁 CI/CD 集成     | 在流水线中配置私服源                            |
| 🧩 Scope 统一管理 | 公司私包统一使用 `@company/` 前缀               |
| ⚡ 缓存策略       | 开启上游 npm 缓存以加速安装                     |
| 🔒 安全           | 只开放内部访问，外部访问需 VPN 或认证           |
| 🧰 包清理         | 定期清理旧包版本，防止仓库膨胀                  |
| ☁️ 云部署         | 可部署在公司云服务器、GitHub Actions、自托管 CI |

---

## 📦 七、实际开发中的使用方式示例

### `.npmrc` 文件（项目级）

```bash
registry=http://npm.mycompany.com/
always-auth=true
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

### 在 CI 环境中

```bash
npm config set registry http://npm.mycompany.com/
npm ci
```

---

## ✅ 总结

| 项目                 | 推荐方案                              |
| -------------------- | ------------------------------------- |
| 小型团队、自建方便   | 🟢 Verdaccio                          |
| 大型企业、多语言支持 | 🟣 Nexus / Artifactory                |
| 无运维需求、云环境   | ☁️ AWS CodeArtifact / GitHub Packages |

---

如果你愿意，我可以帮你写一个：

> 🚀 一键启动的 Verdaccio 私服 Docker Compose 配置
> 包含权限控制、上游 npm 缓存、内网可访问的完整方案。

要我帮你生成这个示例吗？

# 判断客户端 userAgent

# React 导航守卫

非常好 👍，这是前端路由体系中的一个重点问题：**在 React 中如何实现导航守卫（Navigation Guards）**。

虽然 React Router 没有像 Vue 那样自带 “beforeEach / beforeEnter” 守卫机制，但我们完全可以通过 **多种方式实现相同的效果**。
下面我来系统地讲讲各种方案 👇

---

## 🧭 一、什么是导航守卫？

导航守卫的核心目标是：

> 在路由跳转前后，**拦截、验证、重定向或执行逻辑**（如鉴权、权限校验、埋点统计、保存页面状态等）。

常见用途：

- ✅ 登录态校验（未登录跳转登录页）
- ✅ 权限控制（不同角色访问不同页面）
- ✅ 离开页面前保存或弹出确认
- ✅ 路由切换埋点统计

---

## 🧩 二、React 中的常见实现方式

| 方案                             | 原理                   | 特点                  |
| -------------------------------- | ---------------------- | --------------------- |
| 1️⃣ **高阶组件 (HOC) 守卫**       | 封装逻辑在组件外层     | 最传统、简单          |
| 2️⃣ **`<Navigate />` 条件重定向** | 组件渲染时判断         | React Router 官方推荐 |
| 3️⃣ **自定义 Hook 守卫**          | 用 Hook 执行副作用逻辑 | 现代化、灵活          |
| 4️⃣ **全局守卫 (监听路由变化)**   | 监听路由变化并执行逻辑 | 适合埋点、日志等      |
| 5️⃣ **Layout 层拦截**             | 在父路由中集中判断     | 结构清晰、推荐        |

---

## 🚀 三、实践方式详解

### 🧱 1️⃣ 高阶组件 (HOC) 守卫

最简单直观的方式。

```tsx
// withAuthGuard.tsx
import { Navigate } from "react-router-dom";

export function withAuthGuard<T>(Component: React.ComponentType<T>) {
  return (props: T) => {
    const isLogin = !!localStorage.getItem("token");
    if (!isLogin) return <Navigate to="/login" replace />;
    return <Component {...props} />;
  };
}
```

使用：

```tsx
import { withAuthGuard } from "./withAuthGuard";
import Dashboard from "./Dashboard";

export default withAuthGuard(Dashboard);
```

> ✅ 优点：清晰简单；
> ❌ 缺点：每个受控页面都得包一层。

---

### 🧩 2️⃣ 路由组件内部判断（最常用）

```tsx
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const isLogin = !!localStorage.getItem("token");

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return <div>Dashboard</div>;
}
```

> ✅ 推荐用于 **局部守卫**；
> ❌ 不适合重复逻辑较多的场景。

---

### 🪝 3️⃣ 自定义 Hook 守卫（推荐）

可以写一个通用 hook：

```tsx
// useAuthGuard.ts
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useAuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(`/login?redirect=${location.pathname}`, { replace: true });
    }
  }, [navigate, location]);
}
```

然后在需要保护的页面中调用：

```tsx
function Dashboard() {
  useAuthGuard();
  return <div>Dashboard</div>;
}
```

> ✅ 灵活、逻辑集中；
> ✅ 可扩展出多种守卫（权限、路由前置等）。

---

### ⚙️ 4️⃣ 全局守卫（监听路由变化）

React Router v6 没有全局钩子，但可以通过 `useEffect + useLocation` 模拟：

```tsx
// App.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function useGlobalGuard() {
  const location = useLocation();
  useEffect(() => {
    console.log("页面切换到：", location.pathname);
    // 可添加埋点、日志、权限校验等逻辑
  }, [location]);
}

export default function AppRouter() {
  useGlobalGuard();
  // ...
}
```

> ✅ 类似 Vue 的 `beforeEach`；
> ❌ 不支持阻止导航（只能观察）。

---

### 🧩 5️⃣ Layout 层拦截（结构化推荐）

在布局组件中统一判断访问权限。

```tsx
// ProtectedLayout.tsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  const isLogin = !!localStorage.getItem("token");
  return isLogin ? <Outlet /> : <Navigate to="/login" replace />;
}
```

路由配置：

```tsx
import ProtectedLayout from "./ProtectedLayout";

const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
  { path: "/login", element: <Login /> },
]);
```

> ✅ 推荐用于多页面权限统一保护；
> ✅ 支持嵌套路由；
> ✅ 代码结构清晰。

---

## 🔒 六、扩展：权限守卫 (Role-based Guard)

可以扩展 Layout 守卫做角色校验：

```tsx
// RoleLayout.tsx
import { Navigate, Outlet } from "react-router-dom";

export default function RoleLayout({ role }: { role: string }) {
  const userRole = localStorage.getItem("role");
  return userRole === role ? <Outlet /> : <Navigate to="/403" replace />;
}
```

---

## 💡 七、结合 Zustand / Redux 实现全局状态守卫

在大型项目中，通常会把登录状态放在全局 store：

```tsx
// useUserStore.ts
import { create } from "zustand";
export const useUserStore = create(() => ({
  token: "",
  setToken: (t: string) => set({ token: t }),
}));
```

然后守卫逻辑直接读 store：

```tsx
const { token } = useUserStore();
if (!token) return <Navigate to="/login" replace />;
```

---

## ✅ 八、总结推荐

| 场景             | 推荐实现                                |
| ---------------- | --------------------------------------- |
| 登录鉴权         | 🟢 Layout 守卫（`<ProtectedLayout />`） |
| 页面内逻辑       | 🟢 自定义 Hook（`useAuthGuard`）        |
| 路由切换埋点     | 🟢 全局 `useLocation` 监听              |
| 小项目 / Demo    | 🟡 组件内判断 `<Navigate />`            |
| 复杂角色权限系统 | 🔵 Layout + 全局 Store 结合             |

---

是否希望我帮你写一个

> 💥「React Router v6 完整示例：登录 + 权限守卫 + 重定向 + Layout 嵌套路由」
> 的代码模板？
> （可直接拷贝到项目中用）

# 前端水印

# 静态资源加载失败

你提到的 **“静态资源加载失败”** 是前端开发和运维中非常常见的问题，尤其是图片、JS、CSS、字体等文件。处理思路主要分为 **前端容错、缓存优化、CDN/网络策略和监控**。下面我给你系统梳理一遍：

---

## 🧩 一、常见静态资源加载失败的场景

1. **网络问题**

   - 用户网络不稳定、丢包或超时。

2. **路径错误**

   - 路径写错、打包工具输出路径配置不正确。

3. **跨域问题**

   - CDN 或字体文件未设置 CORS。

4. **资源被删除/覆盖**

   - 发布新版本时旧资源被删除或缓存失效。

5. **浏览器缓存问题**

   - 本地缓存和服务器版本不一致导致 304/404。

6. **CDN 节点问题**

   - CDN 节点丢失或同步延迟。

---

## ⚙️ 二、前端容错处理方案

### 1️⃣ 图片资源 fallback

使用 `onError` 或 `onLoadError` 提供备用图：

```jsx
<img
  src={src}
  alt="image"
  onError={(e) => {
    e.currentTarget.src = "/fallback.png";
  }}
/>
```

或封装组件：

```tsx
function Img({ src, fallback, ...props }) {
  const [imgSrc, setImgSrc] = useState(src);
  return <img {...props} src={imgSrc} onError={() => setImgSrc(fallback)} />;
}
```

---

### 2️⃣ JS/CSS 资源动态加载失败重试

前端可动态创建 `<script>` / `<link>` 标签，并监听 `onerror` 重试：

```js
function loadScript(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = () => {
      if (retries > 0) {
        console.log(`Retry loading ${url}, remaining ${retries}`);
        loadScript(url, retries - 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Failed to load ${url}`));
      }
    };
    document.body.appendChild(script);
  });
}
```

---

### 3️⃣ 字体 / WebFont 容错

WebFont 加载失败时，可以：

- 使用本地备选字体：

```css
font-family: "CustomFont", "Arial", sans-serif;
```

- 配合 JS `FontFaceObserver` 检测加载失败，替换为备选字体。

---

### 4️⃣ HTML <img> + CSS 结合

背景图可加 fallback class：

```css
.bg {
  background-image: url("/main.jpg");
}
.bg-fallback {
  background-image: url("/fallback.jpg");
}
```

JS 检测失败时加 `.bg-fallback`。

---

## 🧱 三、网络/缓存层优化

1. **资源 CDN**

   - 静态资源通过 CDN 加速，降低丢包和延迟。

2. **多域名/备用 CDN**

   - 如果主 CDN 失效，可 fallback 到备用 CDN。

3. **版本号 / Hash**

   - `app.js?v=123` 或 `app.[hash].js` 保证资源更新后不会缓存冲突。

4. **Service Worker**

   - 离线缓存和失败重试机制：

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((res) => res || fetch(event.request))
      .catch(() => caches.match("/fallback.png"))
  );
});
```

---

## 🔄 四、前端监控和报警

1. **JS 资源失败**

```js
window.addEventListener(
  "error",
  (e) => {
    if (e.target.tagName === "SCRIPT" || e.target.tagName === "LINK") {
      console.error(
        "Static resource load failed:",
        e.target.src || e.target.href
      );
    }
  },
  true
);
```

2. **图片加载失败**

```js
window.addEventListener(
  "error",
  (e) => {
    if (e.target.tagName === "IMG") {
      console.warn("Image load failed:", e.target.src);
    }
  },
  true
);
```

3. **结合 Sentry / LogRocket / 自建日志**

- 实时监控资源失败情况；
- 提供统计和报警。

---

## 🔧 五、服务端/构建优化

1. **打包路径校验**

   - Webpack / Vite 打包后确认 publicPath 正确。

2. **静态资源自动 fallback**

   - 对于多 CDN 部署，可以通过 Nginx 配置备用源：

```nginx
location /static/ {
  proxy_pass http://cdn1.example.com;
  error_page 502 503 504 = @fallback;
}
location @fallback {
  proxy_pass http://cdn2.example.com;
}
```

3. **开启压缩（gzip/brotli）**

   - 减少网络传输失败概率。

4. **合理缓存策略**

   - 静态资源设置 `Cache-Control`，版本号更新即可刷新。

---

## 💡 六、总结最佳实践

1. **前端容错**

   - 图片 fallback、JS/CSS 重试、Font 替换、Service Worker 离线缓存。

2. **网络优化**

   - CDN + 多节点 + 压缩 + 缓存。

3. **构建与路径**

   - Hash + 公共路径校验，确保资源路径稳定。

4. **监控**

   - 全量监控静态资源加载失败，及时告警和修复。

---

如果你需要，我可以帮你写一个 **前端 React 全量静态资源加载失败容错组件/Hook**，
可以统一处理 **图片、JS、CSS、字体** 的 fallback 和重试逻辑，并带监控上报功能。

你希望我直接帮你写吗？

# DNS

好的，我们来系统地讲一下 **DNS（Domain Name System，域名系统）**，这是互联网的基础服务之一。

---

## 🧩 一、什么是 DNS

DNS 就像互联网的 **“电话簿”**：

- 人类易记的域名（如 `www.example.com`）
- 对应计算机使用的 IP 地址（如 `192.168.1.1` 或 `2606:2800:220:1:248:1893:25c8:1946`）

DNS 的核心功能就是 **域名 → IP 地址的解析**，让浏览器或其他客户端能找到服务器。

---

## 🏗️ 二、DNS 的组成部分

1. **域名 (Domain Name)**

   - 由多级标签组成，右到左分级：

     ```
     www.example.com
     |   |      |
     子域名 域名  顶级域
     ```

2. **DNS 服务器类型**

   - **根服务器（Root Server）**：管理顶级域名（TLD）信息
   - **顶级域服务器（TLD Server）**：管理 `.com`, `.org` 等信息
   - **权威 DNS 服务器（Authoritative Server）**：存储域名实际解析记录
   - **递归 DNS 服务器（Recursive Resolver）**：用户本地或运营商提供，负责查找最终 IP

3. **DNS 记录类型**

   - **A**：IPv4 地址
   - **AAAA**：IPv6 地址
   - **CNAME**：别名（指向其他域名）
   - **MX**：邮件交换
   - **NS**：域名服务器
   - **TXT**：文本记录（SPF/DKIM 等）
   - **SRV**：服务记录

---

## 🔄 三、DNS 解析流程

当你在浏览器输入 `www.example.com`：

1. 浏览器查缓存（浏览器缓存 + OS hosts 文件）
2. 如果未命中 → 查询 **递归 DNS 服务器**（通常是运营商或本地 DNS）
3. 递归服务器查询 **根服务器** → 找到 TLD 服务器
4. TLD 服务器返回权威 DNS 服务器地址
5. 权威 DNS 返回最终 IP
6. 递归服务器缓存结果，并返回给浏览器
7. 浏览器向该 IP 发起 HTTP 请求

> ⚡ 小技巧：DNS 解析通常被缓存，TTL（Time To Live）决定缓存时长。

---

## ⚡ 四、DNS 性能优化与加速

1. **本地缓存**：减少重复解析
2. **DNS 服务器选择**：

   - 公共 DNS：Google `8.8.8.8`, Cloudflare `1.1.1.1`, 阿里 `223.5.5.5`
   - 企业 DNS：内部域名解析

3. **CDN + Anycast DNS**：

   - 静态资源用 CDN 加速
   - Anycast DNS 可以就近解析，提高速度和可用性

4. **DNS 预解析**：

   - HTML 中 `<link rel="dns-prefetch" href="//example.com">` 提前解析

5. **HTTPS 与 DoH（DNS over HTTPS）**：

   - DoH / DoT 提高安全性，防止 DNS 污染和篡改

---

## 🔒 五、DNS 安全问题

1. **DNS 劫持 / 污染**：

   - 将域名解析到错误 IP，常见在公共 Wi-Fi 或 ISP 层

2. **DNS 放大攻击**：

   - DDoS 攻击方式，利用开放 DNS 服务器发送大量流量

3. **DNSSEC**：

   - 数字签名验证 DNS 响应的真实性，防止篡改

---

## 🧠 六、DNS 与前端开发的关系

- **跨域问题**：CORS、子域名访问受 DNS 影响
- **CDN 部署**：DNS 决定用户访问最近节点
- **HTTPS / TLS**：域名验证依赖 DNS 正确解析
- **性能优化**：DNS 解析时间是页面首屏加载时间的一部分

---

✅ 总结一句话：

> DNS 就是互联网的“域名解析系统”，将人类可读域名转化为机器可用 IP，同时影响访问速度、安全和可用性。

---

如果你需要，我可以帮你画一张 **DNS 解析流程图**，从浏览器到权威服务器的完整解析路径，非常直观。

你希望我画吗？

# 图片优化

非常好，这个问题在前端开发和性能优化中非常关键 👍。前端处理图片涉及 **加载速度、带宽、性能和用户体验**。下面我给你系统梳理常见优化方案和实践方法。

---

## 🧩 一、图片优化目标

1. **减小文件体积** → 加快加载速度
2. **控制分辨率 / 尺寸** → 避免渲染浪费
3. **保证视觉质量** → 用户体验不下降
4. **延迟加载** → 提升首屏速度
5. **缓存与 CDN 加速** → 提高可用性和访问速度

---

## 🏗️ 二、前端图片优化方案

### 1️⃣ 图片格式优化

| 格式       | 特点               | 使用场景                            |
| ---------- | ------------------ | ----------------------------------- |
| JPEG / JPG | 有损压缩，高压缩比 | 照片、自然图像                      |
| PNG        | 无损，支持透明     | 图标、LOGO、透明背景                |
| WebP       | 有损/无损，压缩高  | 所有现代浏览器支持，可取代 JPEG/PNG |
| AVIF       | 更高压缩率         | 现代浏览器，可替代 WebP             |
| SVG        | 矢量，缩放无损     | 图标、图表、LOGO                    |

> 💡 实践：对于同一资源，WebP/AVIF 可以显著降低体积，现代浏览器可用 `<picture>` 标签兼容 fallback。

```html
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="example" />
</picture>
```

---

### 2️⃣ 图片尺寸与响应式

1. **按需加载尺寸**

   - 根据显示大小生成对应尺寸的图片
   - `<img srcset="small.jpg 480w, medium.jpg 768w, large.jpg 1200w" sizes="(max-width: 768px) 100vw, 50vw">`

2. **按设备像素比 (DPR) 提供高清图**

   - Retina 屏可使用 2x/3x 图，低分辨率屏用 1x 图

3. **限制最大宽高**

   - 避免浏览器渲染大图缩小造成性能浪费

---

### 3️⃣ 图片压缩

- **构建时压缩**：

  - Webpack/Vite：`image-webpack-loader`、`vite-imagetools`
  - Next.js: `next/image` 自动压缩

- **在线压缩**：

  - TinyPNG、Squoosh

- **质量调节**：

  - JPEG/WEBP 压缩质量 70~80 足够大部分场景

---

### 4️⃣ 图片懒加载（Lazy Loading）

- **原生属性**：

```html
<img src="image.jpg" loading="lazy" alt="example" />
```

- **JS 方案**：

  - Intersection Observer 检测元素进入可视区再加载

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      io.unobserve(entry.target);
    }
  });
});
document.querySelectorAll("img[data-src]").forEach((img) => io.observe(img));
```

> ✅ 可以显著提高首屏速度，尤其是长列表、滚动页面。

---

### 5️⃣ 占位图 / 渐进加载

- **Blur-up / LQIP**：

  - 先加载低分辨率模糊图，再加载高清图

- **Skeleton**：

  - 占位背景色或骨架图占位，提高用户体验

```html
<img src="small.jpg" data-src="large.jpg" class="blur-up" />
```

---

### 6️⃣ CDN 与缓存策略

1. **CDN 加速**

   - 静态资源通过 CDN 提供，减少延迟

2. **合理缓存策略**

   - Cache-Control、ETag、Last-Modified

3. **按地域分发**

   - 用户访问最近节点，提高加载速度

---

### 7️⃣ 图片裁剪与裁切

- **前端裁剪**：

  - 用 Canvas 或库（如 `cropperjs`）裁剪用户上传图片

- **上传前压缩/裁剪**：

  - 减少带宽消耗

- **后端裁剪**：

  - 根据不同尺寸生成缩略图，前端按需加载

```js
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0, width, height);
canvas.toBlob(
  (blob) => {
    /* 上传 blob */
  },
  "image/jpeg",
  0.8
);
```

---

### 8️⃣ WebP / AVIF 替代方案 + Fallback

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="example" />
</picture>
```

> ⚡ 现代浏览器支持 WebP/AVIF，可节省 30~70% 带宽

---

### 9️⃣ 动态生成图 & Canvas 处理

- **场景**：

  - 截图、图表、合成海报

- **优化手段**：

  - Canvas 绘制 → `toBlob` / `toDataURL` 压缩上传
  - Web Worker 异步处理大图，避免阻塞主线程

- **示例**：

```js
const offscreen = new OffscreenCanvas(width, height);
const ctx = offscreen.getContext("2d");
// 绘制图像
ctx.drawImage(image, 0, 0, width, height);
offscreen.convertToBlob({ type: "image/jpeg", quality: 0.8 });
```

---

## 🧠 十、总结

前端图片优化策略可以分为几个层面：

| 层面     | 优化手段                                   |
| -------- | ------------------------------------------ |
| **格式** | WebP/AVIF 替代、SVG 矢量、JPEG/PNG 压缩    |
| **尺寸** | 响应式图片、按设备像素比提供多版本         |
| **加载** | 懒加载、占位图、渐进加载                   |
| **传输** | CDN、压缩、缓存、HTTP/2                    |
| **处理** | 前端裁剪、Canvas 压缩、Web Worker 异步处理 |

> 总结原则：
>
> 1. 尽量减小图片体积
> 2. 按需加载，延迟加载非首屏图片
> 3. 利用现代格式和 CDN 提升性能
> 4. 对用户上传图片尽量前端压缩和裁剪

---

如果你需要，我可以帮你写一个 **React 图片优化组件/Hook**，
支持 **懒加载 + 占位图 + WebP/AVIF fallback + Canvas 压缩上传**，
直接套用在项目里，非常实用。

你希望我帮你写吗？

# Performance API

好的，我们来系统介绍一下 **Performance API**，这是前端性能监控和优化中非常重要的原生浏览器 API。

---

## 🧩 一、什么是 Performance API

**Performance API** 是浏览器提供的一套原生接口，用于 **测量页面性能、资源加载时间、用户交互性能**，包括以下核心目标：

- 页面加载时间分析（Navigation Timing）
- 资源加载时间分析（Resource Timing）
- 自定义性能标记（Mark & Measure）
- 用户交互响应时间分析
- FPS / 帧率分析（PerformanceObserver + paint timing）

它是现代前端性能优化和监控的重要工具。

---

## 🏗️ 二、Performance API 核心接口

### 1️⃣ `performance.now()`

- 返回 **高精度时间戳**，单位为毫秒（小数点后可精确到微秒级）
- 相对于 **页面加载起点** 的时间，而不是系统时间

```js
const start = performance.now();
// 执行某段代码
const end = performance.now();
console.log(`执行时间: ${end - start} ms`);
```

> ✅ 优点：比 `Date.now()` 精度高，适合测量小段代码性能。

---

### 2️⃣ `performance.mark()` & `performance.measure()`

- 用于 **自定义性能标记与测量**

```js
performance.mark("startTask");
// 执行任务
performance.mark("endTask");

performance.measure("taskDuration", "startTask", "endTask");
const measure = performance.getEntriesByName("taskDuration")[0];
console.log(`任务耗时: ${measure.duration} ms`);
```

- 常用于：代码性能监控、函数耗时分析

---

### 3️⃣ `performance.getEntries()`

- 获取 **性能条目列表**（资源、导航、标记、用户交互等）

```js
const entries = performance.getEntries(); // 返回所有性能条目
const resources = performance.getEntriesByType("resource"); // 图片、JS、CSS 等
console.log(resources);
```

- 核心类型：

  - `'navigation'` → 页面加载相关
  - `'resource'` → 静态资源加载
  - `'mark'` → 自定义标记
  - `'measure'` → 自定义测量
  - `'paint'` → 浏览器首次渲染、首次内容渲染

---

### 4️⃣ Navigation Timing API

- 获取 **页面加载性能指标**

```js
const [navigation] = performance.getEntriesByType("navigation");
console.log("重定向耗时: ", navigation.redirectEnd - navigation.redirectStart);
console.log(
  "DNS耗时: ",
  navigation.domainLookupEnd - navigation.domainLookupStart
);
console.log("TCP耗时: ", navigation.connectEnd - navigation.connectStart);
console.log("TTFB: ", navigation.responseStart - navigation.requestStart);
console.log(
  "DOM解析耗时: ",
  navigation.domComplete - navigation.domInteractive
);
console.log("页面加载总耗时: ", navigation.loadEventEnd - navigation.startTime);
```

> 常用于监控首屏加载性能、页面响应速度。

---

### 5️⃣ Resource Timing API

- 获取 **静态资源加载性能**

```js
const resources = performance.getEntriesByType("resource");
resources.forEach((r) => {
  console.log(
    `${r.name} → DNS: ${r.domainLookupEnd - r.domainLookupStart}ms, TCP: ${
      r.connectEnd - r.connectStart
    }ms, 下载: ${r.responseEnd - r.responseStart}ms`
  );
});
```

- 可分析：

  - 图片、JS、CSS 加载耗时
  - CDN 节点性能
  - 静态资源优化方向

---

### 6️⃣ Paint Timing API

- 浏览器首次渲染性能指标：

  - `first-paint` (FP) → 首次绘制
  - `first-contentful-paint` (FCP) → 首次内容绘制

```js
const paintEntries = performance.getEntriesByType("paint");
paintEntries.forEach((entry) => console.log(entry.name, entry.startTime));
```

> 常用于衡量首屏加载体验。

---

### 7️⃣ PerformanceObserver

- 实时监听性能事件，避免轮询
- 适合 SPA 或实时监控资源

```js
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log("性能条目:", entry);
  });
});
observer.observe({ type: "resource", buffered: true });
```

- 可监听类型：`'resource'`, `'paint'`, `'longtask'`, `'layout-shift'`, `'measure'` 等

---

### 8️⃣ Long Tasks & Layout Shift

- **Long Tasks API** → JS 阻塞 / 性能瓶颈
- **Layout Shift (CLS)** → 页面视觉稳定性
- 都可通过 `PerformanceObserver` 监听

```js
const obs = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log("长任务耗时:", entry.duration);
  });
});
obs.observe({ type: "longtask", buffered: true });
```

---

## ⚡ 八、前端常用性能指标

| 指标         | 描述               | API                                 |
| ------------ | ------------------ | ----------------------------------- |
| DNS 查询耗时 | 域名解析耗时       | Navigation Timing                   |
| TCP 连接耗时 | 建立连接耗时       | Navigation Timing                   |
| TTFB         | 第一个字节到达时间 | Navigation Timing                   |
| FCP          | 首次内容渲染       | Paint Timing                        |
| LCP          | 最大内容渲染       | Largest Contentful Paint（LCP API） |
| CLS          | 页面布局稳定性     | Layout Shift                        |
| JS 执行耗时  | 脚本阻塞           | Long Task / PerformanceObserver     |

---

## 🧠 九、使用场景

1. **代码性能分析**

   - 计算函数、组件、事件处理耗时

2. **页面性能监控**

   - SPA 首屏加载、路由切换耗时

3. **资源优化**

   - 图片、JS、CSS 加载时间分析

4. **用户体验指标**

   - FCP、LCP、CLS、TTI（Time To Interactive）

5. **埋点监控**

   - 发送自定义性能指标到后台

---

## ✅ 十、总结

**Performance API** 是浏览器提供的前端性能测量工具，关键价值：

1. **高精度计时** → 精确分析代码或资源耗时
2. **页面/资源/用户交互监控** → 可分析加载和渲染瓶颈
3. **自定义标记与度量** → 可自定义埋点指标
4. **与监控系统结合** → 可发送到后端形成性能数据分析

> 💡 建议：
>
> - SPA 项目：PerformanceObserver + Navigation/Resource Timing
> - 静态页面：Paint Timing + mark/measure
> - 前端监控系统：收集 FCP、LCP、TTFB、JS 长任务等关键指标

---

我可以帮你写一个 **React/JS 全量 Performance API 性能监控 Hook**，
可以自动收集 **FCP、LCP、CLS、资源加载时间、函数耗时** 并上报，非常实用。

你希望我直接帮你写吗？

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

# 项目更新后，如何提示用户刷新页面

在前端项目中，**当新版本上线时提示用户刷新页面**是非常常见的需求，尤其是 SPA（单页应用），因为浏览器可能会缓存旧的 JS/CSS，导致用户仍在使用旧版本。下面我给你系统梳理几种常用方案：

---

## 🧩 一、问题背景

1. SPA 的 JS/CSS 是静态资源，一旦用户打开页面，会被浏览器缓存。
2. 项目更新后，如果用户不刷新页面，会出现：

   - 新功能不生效
   - 旧逻辑异常
   - 数据和接口不匹配

**目标**：在检测到新版本时，提示用户刷新页面或自动刷新。

---

## 🏗️ 二、实现方案

### 1️⃣ 利用 **Service Worker + Workbox**

如果项目使用 **PWA 或 Service Worker**，可以通过监听 `updatefound` 或 `controllerchange` 事件：

```js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then((registration) => {
    registration.onupdatefound = () => {
      const newWorker = registration.installing;
      newWorker.onstatechange = () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          alert("新版本已上线，点击确认刷新页面");
          window.location.reload();
        }
      };
    };
  });
}
```

- ✅ 优点：适合 PWA
- ✅ 可控制缓存策略
- ⚠️ 缺点：需要配置 SW 和缓存更新策略

---

### 2️⃣ 利用 **文件 hash/version 检测**

前端构建时，生成一个版本文件（或在 `index.html` 中嵌入 hash）：

```json
// version.json
{
  "version": "1.0.3"
}
```

前端定时请求这个文件：

```js
let currentVersion = "1.0.3";

async function checkVersion() {
  const res = await fetch("/version.json", { cache: "no-store" });
  const data = await res.json();
  if (data.version !== currentVersion) {
    if (confirm("新版本已上线，是否刷新页面？")) {
      window.location.reload();
    }
  }
}

setInterval(checkVersion, 5 * 60 * 1000); // 每5分钟检测一次
```

- ✅ 优点：简单，适合非 PWA
- ✅ 控制刷新逻辑灵活
- ⚠️ 缺点：需要后端提供 version 文件

---

### 3️⃣ 利用 **HTTP Header 缓存策略**

- 给 HTML 文件设置 **短缓存**，JS/CSS 文件设置 **长缓存 + hash**
- 这样用户访问页面时，HTML 会尽快获取到最新版本信息
- 示例：

```http
Cache-Control: no-cache
```

> 页面请求 HTML 时自动更新，不依赖 JS 轮询，但需合理配置静态资源 hash

---

### 4️⃣ 利用 **WebSocket 或 SSE 实时推送**

- 当服务端发布新版本时，通过 WebSocket 或 SSE 通知客户端刷新

```js
const ws = new WebSocket("wss://example.com/version");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.version !== CURRENT_VERSION) {
    if (confirm("检测到新版本，刷新页面？")) window.location.reload();
  }
};
```

- ✅ 实时，用户不需要等待轮询
- ⚠️ 需要服务端支持推送

---

### 5️⃣ 在 React/Vite/CRA 项目中使用 `import.meta.env` 或 `process.env`

- 在构建时嵌入版本号：

```ts
const VERSION = import.meta.env.VITE_APP_VERSION;
```

- 与后端返回的版本号对比，提示用户刷新

---

## ⚡ 六、提示方式

1. **弹窗提醒**

   - 简单直接，用户可自主刷新

2. **顶部通知条**

   - UX 友好，不打断用户操作

3. **静默刷新**

   - 直接 `window.location.reload()`，适合重要更新或内部系统

示例通知条（React + Tailwind）：

```tsx
{
  showBanner && (
    <div className="fixed top-0 w-full bg-yellow-400 text-center p-2">
      新版本已上线{" "}
      <button onClick={() => window.location.reload()}>刷新</button>
    </div>
  );
}
```

---

## 🧠 七、最佳实践

1. **HTML 文件短缓存**，静态资源使用 hash + 长缓存
2. **版本文件检测**或 **Service Worker update** 结合
3. **通知用户而非强制刷新**，提高 UX
4. **重要更新可强制刷新**，普通更新可提示
5. **SPA 与 PWA 项目结合 Service Worker** 更适合复杂场景

---

我可以帮你写一个 **React + Vite SPA 版本检测组件**，
支持 **自动轮询 version.json + 顶部通知条 + 刷新按钮**，
用户体验最佳，可直接放到项目里。

你希望我直接帮你写吗？

# Canvas

## 事件交互

## GPU 加速（webGL 结合）

# 弱网检测

弱网检测是前端性能优化和用户体验改善中非常重要的一环，尤其是在移动端或跨地域访问场景下。下面我给你系统梳理 **弱网检测的方案和实现方法**。

---

## 🧩 一、弱网的定义

- 网络速度慢、丢包率高、延迟大
- 典型表现：

  - 首屏渲染慢
  - 图片/视频加载慢
  - 请求超时、接口失败

> 前端需要根据弱网状态做优化：降级图片质量、延迟非核心资源加载、提示用户网络不佳。

---

## 🏗️ 二、弱网检测方案

### 1️⃣ **Network Information API（现代浏览器）**

- 浏览器提供 `navigator.connection` 对象，可获取网络类型和带宽信息

```js
const connection =
  navigator.connection || navigator.mozConnection || navigator.webkitConnection;

if (connection) {
  console.log("网络类型:", connection.effectiveType); // 'slow-2g', '2g', '3g', '4g'
  console.log("下行带宽:", connection.downlink, "Mb/s");
  console.log("RTT:", connection.rtt, "ms");
  console.log("是否节省流量模式:", connection.saveData);

  connection.addEventListener("change", () => {
    console.log("网络状态变化:", connection.effectiveType);
  });
}
```

- ✅ 优点：原生 API，实时获取网络状态
- ⚠️ 缺点：兼容性有限，部分 iOS / Safari 不支持

---

### 2️⃣ **通过请求测试网络速度**

- **思路**：请求一个小文件或资源，测量加载时间或下载速度

```js
async function testNetwork() {
  const start = performance.now();
  try {
    await fetch("/small-test-file.png", { cache: "no-store" });
    const end = performance.now();
    const duration = end - start;
    if (duration > 2000) console.log("网络较慢");
    else console.log("网络正常");
  } catch (e) {
    console.log("请求失败，可能是弱网");
  }
}

testNetwork();
```

- ✅ 优点：兼容所有浏览器
- ⚠️ 缺点：增加额外请求，需要控制频率

---

### 3️⃣ **通过 AJAX / 接口响应时间判断**

- 测量接口请求的 RTT（往返时间）

```js
const start = performance.now();
fetch("/api/ping")
  .then((res) => res.json())
  .then(() => {
    const duration = performance.now() - start;
    if (duration > 2000) console.log("弱网环境");
  });
```

- ✅ 适合 SPA 或接口频繁的场景
- ⚠️ RTT 可能受服务器负载影响，需要综合判断

---

### 4️⃣ **结合图片加载 / 资源加载时间**

- 使用 `performance.getEntriesByType('resource')` 获取资源加载时间
- 例如首屏图片加载超过 2 秒 → 弱网提示

```js
const resources = performance.getEntriesByType("resource");
resources.forEach((r) => {
  if (r.duration > 2000) console.log("加载慢，可能弱网");
});
```

- ✅ 可精准定位慢资源
- ⚠️ 仅在页面加载时可检测

---

### 5️⃣ **用户手动设置 / save-data 模式**

- 利用 `navigator.connection.saveData` 判断用户是否开启节省流量模式
- 可自动降低图片质量或视频分辨率

```js
if (connection && connection.saveData) {
  console.log("用户开启节省流量模式");
}
```

---

### 6️⃣ **综合评分方案**

- 综合多维度数据，形成弱网判断：

  1. 网络类型（2G/3G/4G/WiFi）
  2. 接口平均 RTT
  3. 资源加载耗时
  4. 用户 save-data 模式

```js
function isWeakNetwork({ effectiveType, rtt, duration, saveData }) {
  if (saveData) return true;
  if (effectiveType === "2g" || rtt > 300 || duration > 3000) return true;
  return false;
}
```

---

## ⚡ 三、弱网优化策略

1. **图片降级**

   - WebP / AVIF / 缩略图

2. **懒加载非核心资源**
3. **减少请求次数 / 请求合并**
4. **降低动画帧率 / 复杂度**
5. **显示弱网提示**

   - “当前网络较慢，建议使用 WiFi”

---

## 🧠 四、总结

| 方案                    | 优点                       | 缺点                       |
| ----------------------- | -------------------------- | -------------------------- |
| Network Information API | 原生实时获取网络类型和带宽 | 兼容性有限                 |
| 请求测试文件 / AJAX RTT | 所有浏览器可用             | 增加额外请求，需控制频率   |
| 资源加载耗时分析        | 可定位慢资源               | 只能在加载时检测           |
| 用户 save-data 模式     | 可降低流量消耗             | 用户不一定弱网，但想省流量 |

> 🔑 核心原则：**检测网络状况 + 动态降级资源**，保障弱网下的用户体验。

---

我可以帮你写一个 **前端 React 弱网检测 Hook**，
支持 **实时检测网络类型、接口 RTT、资源加载慢速**，并自动触发 **图片降级或提示用户**。

你希望我直接帮你写吗？

# 数组 Array

函数哪些可以改变自身，哪些不会

# flex

# URLSearchParams

好的，我们来系统介绍一下 **`URLSearchParams`**，这是现代浏览器提供的原生 API，用于 **解析和操作 URL 查询参数（query string）**，非常方便。

---

## 🧩 一、什么是 URLSearchParams

- 它是一个类，用来处理 URL 中 `?key1=value1&key2=value2` 的查询参数
- 可以 **读取、增加、修改、删除、迭代** 参数

```js
const params = new URLSearchParams("?name=Alice&age=20");
```

---

## 🏗️ 二、常用方法

### 1️⃣ `get(name)`

- 获取参数值，返回字符串（第一个匹配的值）

```js
const params = new URLSearchParams("?name=Alice&age=20");
console.log(params.get("name")); // 'Alice'
console.log(params.get("age")); // '20'
console.log(params.get("gender")); // null
```

---

### 2️⃣ `getAll(name)`

- 获取所有同名参数值，返回数组

```js
const params = new URLSearchParams("?tag=js&tag=react");
console.log(params.getAll("tag")); // ['js', 'react']
```

---

### 3️⃣ `has(name)`

- 判断参数是否存在

```js
const params = new URLSearchParams("?name=Alice");
console.log(params.has("name")); // true
console.log(params.has("age")); // false
```

---

### 4️⃣ `set(name, value)`

- 设置参数值，如果存在则覆盖，否则添加

```js
const params = new URLSearchParams("?name=Alice");
params.set("name", "Bob"); // 覆盖
params.set("age", "20"); // 添加
console.log(params.toString()); // 'name=Bob&age=20'
```

---

### 5️⃣ `append(name, value)`

- 添加一个新的参数（不会覆盖已有同名参数）

```js
const params = new URLSearchParams("?tag=js");
params.append("tag", "react");
console.log(params.toString()); // 'tag=js&tag=react'
```

---

### 6️⃣ `delete(name)`

- 删除参数

```js
const params = new URLSearchParams("?name=Alice&age=20");
params.delete("age");
console.log(params.toString()); // 'name=Alice'
```

---

### 7️⃣ `toString()`

- 转为查询字符串

```js
const params = new URLSearchParams();
params.append("foo", "bar");
params.append("baz", "qux");
console.log(params.toString()); // 'foo=bar&baz=qux'
```

---

### 8️⃣ 遍历参数

#### `forEach` 遍历

```js
const params = new URLSearchParams("?name=Alice&age=20");
params.forEach((value, key) => {
  console.log(key, value);
});
// 输出:
// name Alice
// age 20
```

#### `entries()` / `keys()` / `values()`

```js
for (const [key, value] of params.entries()) console.log(key, value);
for (const key of params.keys()) console.log(key);
for (const value of params.values()) console.log(value);
```

---

### 9️⃣ 从 URL 对象获取查询参数

```js
const url = new URL("https://example.com/?name=Alice&age=20");
const params = url.searchParams;
console.log(params.get("name")); // 'Alice'
```

---

## ⚡ 十、实用技巧

1. **构建带参数的 URL**

```js
const params = new URLSearchParams({ name: "Alice", age: 20 });
const url = `https://example.com?${params.toString()}`;
console.log(url); // 'https://example.com?name=Alice&age=20'
```

2. **处理数组参数**

```js
const params = new URLSearchParams();
["js", "react"].forEach((tag) => params.append("tag", tag));
console.log(params.toString()); // 'tag=js&tag=react'
```

3. **更新 URL 而不刷新页面（SPA）**

```js
const params = new URLSearchParams(window.location.search);
params.set("page", "2");
history.replaceState(null, "", "?" + params.toString());
```

---

✅ 总结：

- `get` / `getAll` → 读取
- `set` / `append` → 修改/增加
- `delete` → 删除
- `has` → 判断
- `toString` → 转字符串
- `forEach` / `entries` / `keys` / `values` → 遍历

---

我可以帮你写一个 **React Hook 封装的 URLSearchParams 工具**，
支持 **读写参数 + 自动更新 URL + 响应参数变化**，非常方便 SPA 使用。

你希望我帮你写吗？

# 多主题色可供选择的场景

好的，这个问题在现代前端应用中非常常见，尤其是 **支持用户自定义主题或深色模式** 的场景。下面我给你系统梳理前端实现多主题色方案及优化策略。

---

## 🧩 一、问题场景

- 页面支持 **多种主题色**（如浅色、深色，或者品牌色红/蓝/绿等）

- 主题色可能会影响：

  - **背景色 / 文本色 / 按钮色**
  - **图标 / 图片 / SVG**
  - **第三方组件库样式**

- 目标：

  1. 用户切换主题即时生效
  2. 页面刷新后仍保持用户选择
  3. 主题切换性能高，不影响渲染

---

## 🏗️ 二、常用实现方案

### 1️⃣ CSS Variables（推荐方案）

- 利用 **CSS 自定义属性**（`--color-primary`）动态切换主题
- 原理：在 `:root` 或容器上定义变量，JS 改变变量值即可

**示例：**

```css
/* 默认主题 */
:root {
  --color-bg: #ffffff;
  --color-text: #333333;
  --color-primary: #1890ff;
}

/* 深色主题 */
[data-theme="dark"] {
  --color-bg: #1f1f1f;
  --color-text: #f0f0f0;
  --color-primary: #722ed1;
}

/* 使用变量 */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

button {
  background-color: var(--color-primary);
  color: #fff;
}
```

**JS 切换主题：**

```js
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme); // 保存用户选择
}

// 初始化
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);
```

✅ 优点：

- 性能高，切换不刷新页面
- 支持动态计算色彩
- 与现代框架（React/Vue）结合方便

---

### 2️⃣ SCSS / Less 变量 + 构建多主题

- 每种主题生成不同的 CSS 文件
- 页面切换时替换 `<link>` 标签

```html
<link id="theme-link" rel="stylesheet" href="theme-light.css" />
```

```js
function switchTheme(theme) {
  document.getElementById("theme-link").href = `theme-${theme}.css`;
}
```

✅ 优点：

- 样式清晰、可维护
  ⚠️ 缺点：
- 切换需要重新加载 CSS
- 不适合主题很多或动态主题

---

### 3️⃣ CSS-in-JS（如 styled-components / Emotion）

- 主题通过 **ThemeProvider** 提供，组件通过 props 使用

```jsx
<ThemeProvider theme={currentTheme}>
  <App />
</ThemeProvider>
```

- 优点：

  - 动态主题切换灵活
  - 与 React 完美结合

- 缺点：

  - 样式依赖 JS，性能略低于纯 CSS

---

### 4️⃣ 图标 / 图片 / SVG 多主题处理

- **CSS filter**（简单颜色调整，但有限）
- **SVG fill / stroke** 动态修改
- **多版本图片**（如 dark/light）
- 推荐：尽量使用 **SVG + CSS 变量**，动态修改颜色

```css
.icon {
  fill: var(--color-primary);
}
```

---

### 5️⃣ 保存用户主题偏好

1. **localStorage / sessionStorage**
2. **cookie**（服务端渲染时可读取）
3. **后端用户配置**（登录后跨设备同步）

```js
localStorage.setItem("theme", theme);
const theme = localStorage.getItem("theme") || "light";
setTheme(theme);
```

---

### 6️⃣ 支持系统主题自动切换

- 利用 **prefers-color-scheme** 媒体查询

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1f1f1f;
    --color-text: #f0f0f0;
  }
}
```

- 可以结合 JS 检测：

```js
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(prefersDark ? "dark" : "light");
```

---

## ⚡ 七、性能优化

1. **尽量使用 CSS Variables**，避免重新渲染大量 DOM
2. **只切换必要样式**，组件内尽量使用 `var(--xxx)`
3. **懒加载主题资源**（多主题 CSS）
4. **SVG / Icon 动态绑定变量**，避免切换图片

---

## 🧠 八、总结

| 方案             | 优缺点                  | 适用场景                 |
| ---------------- | ----------------------- | ------------------------ |
| CSS Variables    | 性能高，动态切换        | SPA、React/Vue、动态主题 |
| SCSS/Less 多文件 | 样式清晰，切换需 reload | 主题数量有限、静态主题   |
| CSS-in-JS        | 灵活，组件化            | React/Vue，动态主题切换  |
| 图标/图片替换    | 支持复杂图像            | 图标、品牌色图片         |

**最佳实践**：

1. 核心色彩使用 CSS Variables
2. 保存用户选择，刷新保持主题
3. 支持系统偏好自动切换
4. 图标尽量用 SVG + CSS 变量

---

如果你需要，我可以帮你写一个 **React 多主题切换方案**，
支持 **动态切换 + localStorage 保存 + SVG 适配 + dark/light 自动切换**，
可以直接套用到项目里，非常实用。

你希望我帮你写吗？

# DOMContentLoaded 事件和 load 事件有什么区别

好的，我们来系统梳理一下 **`DOMContentLoaded`** 和 **`load`** 事件的区别，这是前端页面加载性能和事件管理中非常重要的概念。

---

## 🧩 一、定义对比

| 事件               | 触发时机                                         | 包含资源                                          | 用途                                       |
| ------------------ | ------------------------------------------------ | ------------------------------------------------- | ------------------------------------------ |
| `DOMContentLoaded` | 当 **HTML 文档被完全解析**，DOM 树构建完成时触发 | 不等待图片、CSS、iframe、音视频等外部资源加载完成 | 可以安全操作 DOM，绑定事件、初始化组件     |
| `load`             | 当 **页面及其所有资源完全加载** 后触发           | 图片、CSS、JS、iframe、字体等所有资源都加载完成   | 确保页面完全渲染，可执行依赖外部资源的逻辑 |

---

## 🏗️ 二、触发顺序

1. 浏览器开始解析 HTML
2. 遇到 `<script>` 标签：

   - 默认阻塞 DOM 解析，执行 JS

3. DOM 树解析完成 → **`DOMContentLoaded`**
4. 页面所有外部资源加载完成 → **`load`**

> 🔹 简单记忆：
>
> - `DOMContentLoaded` = DOM 可操作
> - `load` = 页面完全可用（含图片、iframe、字体等）

---

## 🏷️ 三、代码示例

```js
// DOM 解析完成触发
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM 已经解析完成，可以安全操作 DOM");
});

// 页面及资源加载完成触发
window.addEventListener("load", () => {
  console.log("页面及所有资源加载完成");
});
```

---

### 示例对比：

```html
<img src="large-image.jpg" />
<script>
  document.addEventListener("DOMContentLoaded", () =>
    console.log("DOMContentLoaded")
  );
  window.addEventListener("load", () => console.log("load"));
</script>
```

- 如果 `large-image.jpg` 加载很慢：

  - `DOMContentLoaded` 可能很快触发
  - `load` 要等图片加载完成才触发

---

## ⚡ 四、使用场景

| 事件               | 适用场景                                     |
| ------------------ | -------------------------------------------- |
| `DOMContentLoaded` | 初始化 DOM、绑定事件、渲染组件、计算元素尺寸 |
| `load`             | 页面依赖资源完全加载的场景，如：             |

- 大图懒加载
- Canvas/图片绘制
- 第三方 SDK 初始化 |

---

## 🧠 五、优化建议

1. **尽量用 `DOMContentLoaded`** 初始化页面逻辑，避免阻塞
2. **`load` 仅用于依赖外部资源的逻辑**
3. SPA 通常在路由挂载或组件挂载时初始化，不依赖 `load`
4. 可结合 **Performance API** 分析加载性能：

```js
window.addEventListener("load", () => {
  console.log("页面完全加载耗时:", performance.now());
});
```

---

✅ 总结：

- **`DOMContentLoaded`** = DOM 树完成，适合操作 DOM
- **`load`** = 页面及所有资源加载完成，适合依赖资源的操作
- **触发顺序**：`DOMContentLoaded` → `load`

---

我可以帮你画一张 **时间轴示意图**，清楚显示 HTML 解析、DOM 树完成、CSS/图片加载、事件触发顺序，非常直观。

你希望我画吗？

# 如何实现页面文本不可选中，不可复制

在前端中，让页面文本 **不可选中、不可复制** 可以通过 **CSS** 和 **JavaScript** 两种方式实现，具体如下：

---

## 🧩 一、CSS 实现（推荐）

### 1️⃣ 禁止文本选中

```css
.noselect {
  user-select: none; /* 标准写法 */
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE/Edge */
}
```

- `user-select: none;` 可以禁止 **鼠标拖动选中文本**
- 可以应用在 `<body>` 或具体容器上：

```css
body {
  user-select: none;
}
```

---

### 2️⃣ 禁止复制

CSS 本身无法完全阻止复制，需要结合 JS 阻止 `copy` 事件：

```js
document.addEventListener("copy", (e) => {
  e.preventDefault();
  alert("复制已被禁止");
});
```

- 阻止快捷键 Ctrl+C / Cmd+C
- 阻止右键菜单中的复制

---

## 🏗️ 二、JavaScript 实现

### 1️⃣ 禁止右键菜单

```js
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
```

- 防止用户通过右键菜单复制文本
- 可结合 CSS 禁止选择效果增强保护

### 2️⃣ 禁止拖拽或选中

```js
document.addEventListener("selectstart", (e) => {
  e.preventDefault(); // 阻止拖动选中
});
```

### 3️⃣ 组合示例（推荐）

```js
document.addEventListener("copy", (e) => e.preventDefault());
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());
```

---

## ⚡ 三、注意事项

1. **安全性有限**：

   - 用户仍可通过浏览器开发者工具获取文本
   - 或通过截屏 / OCR 提取内容
   - 前端无法完全防止文本泄露

2. **体验影响**：

   - 阻止右键菜单和选中可能影响正常操作
   - 建议只对敏感内容使用

3. **SVG / Canvas 文本**：

   - Canvas 绘制文本默认无法选中
   - 对于图片文本，可以直接使用 Canvas 或 SVG 输出

---

## 🧠 四、总结

| 方法                | 功能         | 备注                 |
| ------------------- | ------------ | -------------------- |
| `user-select: none` | 禁止鼠标选中 | CSS 原生支持，性能高 |
| `copy` 事件         | 阻止复制     | 阻止快捷键和右键复制 |
| `contextmenu`       | 阻止右键菜单 | 防止右键复制         |
| `selectstart`       | 阻止选中开始 | 可增强兼容性         |
| Canvas / SVG        | 文本不可选   | 适合图片化文本显示   |

> 💡 建议：CSS + JS 组合使用，体验更平滑，但不能保证 100% 安全。

---

如果你需要，我可以帮你写一个 **React 高阶组件 HOC**，
可以让 **包裹的内容全部不可选中、不可复制、不可右键**，
直接套用在项目里。

你希望我帮你写吗？

# 如何进行代码质量检测

# http 缓存

好的，我们系统来梳理一下 **HTTP 缓存**，这是前端性能优化和资源加载加速的核心手段。

---

## 🧩 一、HTTP 缓存的作用

- 减少重复请求，提高页面加载速度
- 降低服务器压力
- 减少带宽消耗
- 改善用户体验，尤其是弱网环境

> 浏览器缓存是基于 HTTP 协议和资源响应头实现的，不同策略决定了资源是否可复用或何时更新。

---

## 🏗️ 二、缓存分类

### 1️⃣ 强缓存（Cache-Control / Expires）

**原理**：浏览器直接使用缓存，不向服务器发送请求，直到缓存过期。

#### 1.1 Cache-Control（HTTP/1.1 标准）

常用指令：

| 指令           | 含义                                   |
| -------------- | -------------------------------------- |
| `max-age=秒数` | 缓存有效时间                           |
| `public`       | 所有人可缓存                           |
| `private`      | 只有浏览器可缓存                       |
| `no-cache`     | 必须向服务器验证缓存有效性（仍可缓存） |
| `no-store`     | 不缓存资源                             |

**示例**：

```http
Cache-Control: public, max-age=3600
```

- 表示资源可缓存 1 小时

#### 1.2 Expires（HTTP/1.0）

```http
Expires: Wed, 09 Oct 2025 20:00:00 GMT
```

- 过期时间点
- 已被 Cache-Control 替代，但仍被浏览器支持
- 注意：客户端时间不准可能影响缓存策略

✅ **强缓存特点**：

- 浏览器直接使用缓存
- 不发请求给服务器
- 性能最好

---

### 2️⃣ 协商缓存（Conditional Request）

**原理**：浏览器每次向服务器发送请求，服务器判断资源是否改变，如果没变返回 **304 Not Modified**，浏览器使用缓存。

#### 2.1 ETag

- 资源唯一标识（hash、版本号）
- 浏览器请求时发送：

```http
If-None-Match: "abc123"
```

- 服务器返回：

```http
ETag: "abc123"
```

- 如果匹配 → 304 Not Modified

#### 2.2 Last-Modified

- 资源最后修改时间
- 浏览器请求时发送：

```http
If-Modified-Since: Tue, 08 Oct 2025 12:00:00 GMT
```

- 服务器比对 → 返回 304 或新内容

✅ **协商缓存特点**：

- 节省流量，仍需向服务器验证
- 适合经常更新的资源

---

### 3️⃣ 浏览器缓存流程

1. 浏览器请求资源
2. 检查 **强缓存**：

   - 未过期 → 直接使用缓存
   - 已过期 → 发送请求

3. 服务器检查 **协商缓存**：

   - 资源未修改 → 返回 304
   - 资源修改 → 返回新资源

---

## ⚡ 三、缓存策略推荐

| 资源类型        | 建议缓存策略                                                                |
| --------------- | --------------------------------------------------------------------------- |
| JS/CSS/静态文件 | 长缓存（1 年） + 文件名带 hash → Cache-Control: max-age=31536000, immutable |
| 图片 / 视频     | 长缓存 + hash                                                               |
| HTML 页面       | 短缓存或 no-cache + ETag → 保证内容更新及时                                 |
| API 接口        | 一般不缓存，或使用协商缓存 / CDN 缓存                                       |

---

### 1️⃣ SPA 项目优化实践

- **静态资源**使用 hash 文件名 + 长缓存
- **HTML**使用短缓存或协商缓存
- **图片**尽量使用 CDN + 长缓存

示例：

```http
# app.abc123.js
Cache-Control: public, max-age=31536000, immutable

# index.html
Cache-Control: no-cache
ETag: "index-1.0.3"
```

> 用户刷新页面时，如果 HTML 文件没更新，浏览器通过协商缓存请求 JS/CSS 新 hash 文件

---

### 2️⃣ CDN 缓存优化

- 静态资源通过 CDN 缓存，加速全球访问
- 搭配 Cache-Control + hash 文件名，保证更新及时

---

### 3️⃣ 强缓存 + 协商缓存结合

- 推荐组合策略：

  1. **静态文件** → 强缓存 + hash
  2. **HTML / API** → 协商缓存，保证更新

- 达到 **性能最大化 + 更新及时**

---

## 🧠 四、总结

1. **强缓存**：浏览器直接使用，不请求服务器

   - Cache-Control / Expires

2. **协商缓存**：浏览器发送请求，服务器返回 304 或新资源

   - ETag / Last-Modified

3. **最佳实践**：

   - JS/CSS/图片 → 长缓存 + hash
   - HTML → 短缓存 + 协商缓存
   - API → 一般不缓存或使用协商缓存

---

我可以帮你画一个 **HTTP 缓存流程图**，清晰显示 **浏览器强缓存 → 协商缓存 → 服务器返回 304/200** 的整个流程，直观易懂。

你希望我画吗？

# http 向 https 做重定向应该使用哪个状态码

## http header content-type 为 application/octet-stream

# navigator

好的，我们来系统介绍一下 **`navigator`** 对象，这是前端 JavaScript 中用于获取 **浏览器信息、设备信息和网络状态** 的核心对象。

---

## 🧩 一、什么是 `navigator`

- `navigator` 是浏览器提供的 **全局对象**，属于 **`window.navigator`**
- 主要用途：

  1. 获取浏览器信息（User Agent、版本、平台）
  2. 获取设备信息（在线状态、语言）
  3. 检测网络状况
  4. 提供一些浏览器能力 API

> `navigator` 对象大部分属性只读，不能修改浏览器本身信息。

---

## 🏗️ 二、常用属性

| 属性                            | 描述                                    | 示例                                             |
| ------------------------------- | --------------------------------------- | ------------------------------------------------ |
| `navigator.userAgent`           | 浏览器 User Agent 字符串                | `'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'` |
| `navigator.platform`            | 操作系统平台                            | `'Win32'`、`'MacIntel'`                          |
| `navigator.appVersion`          | 浏览器版本信息                          | `'5.0 (Windows)...'`                             |
| `navigator.language`            | 浏览器首选语言                          | `'zh-CN'`                                        |
| `navigator.languages`           | 支持的语言列表                          | `['zh-CN','en-US']`                              |
| `navigator.onLine`              | 网络是否在线                            | `true` / `false`                                 |
| `navigator.cookieEnabled`       | 是否启用 Cookie                         | `true` / `false`                                 |
| `navigator.hardwareConcurrency` | CPU 核心数                              | `4`                                              |
| `navigator.deviceMemory`        | 设备内存 (GB)                           | `8`                                              |
| `navigator.connection`          | 网络信息对象（Network Information API） | `{effectiveType: '4g', downlink: 10, rtt: 50}`   |
| `navigator.geolocation`         | 地理定位 API                            | `navigator.geolocation.getCurrentPosition(...)`  |
| `navigator.clipboard`           | 剪贴板 API                              | `navigator.clipboard.writeText('Hello')`         |

---

## 🏗️ 三、常用方法

| 方法                                                       | 描述                     | 示例                                                                        |
| ---------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------- |
| `navigator.geolocation.getCurrentPosition(success, error)` | 获取用户位置             | `navigator.geolocation.getCurrentPosition(pos => console.log(pos.coords));` |
| `navigator.geolocation.watchPosition(success, error)`      | 监听位置变化             | 监听 GPS 移动                                                               |
| `navigator.clipboard.writeText(text)`                      | 写入剪贴板               | `navigator.clipboard.writeText('Hello')`                                    |
| `navigator.clipboard.readText()`                           | 读取剪贴板               | `const text = await navigator.clipboard.readText();`                        |
| `navigator.registerProtocolHandler()`                      | 注册自定义协议处理       | 注册 mailto、web+ 自定义协议                                                |
| `navigator.sendBeacon(url, data)`                          | 异步发送数据，常用于统计 | `navigator.sendBeacon('/log', JSON.stringify(data));`                       |

---

## 🏷️ 四、Network Information API

- `navigator.connection` 提供网络状况信息

```js
const connection = navigator.connection;
console.log(connection.effectiveType); // '2g', '3g', '4g', 'slow-2g'
console.log(connection.downlink); // Mbps
console.log(connection.rtt); // 延迟 ms
console.log(connection.saveData); // 节省流量模式
```

- 可监听网络状态变化：

```js
connection.addEventListener("change", () => {
  console.log("网络状态变化:", connection.effectiveType);
});
```

---

## 🏷️ 五、使用场景

1. **用户体验优化**

   - 根据 `navigator.language` 显示多语言
   - 根据 `navigator.onLine` 弱网提示
   - 根据 `navigator.connection.effectiveType` 动态降低图片质量

2. **设备适配**

   - 根据 `navigator.platform` / `hardwareConcurrency` 调整性能
   - Canvas、WebGL 等渲染优化

3. **权限和能力检测**

   - `navigator.geolocation` 判断是否支持定位
   - `navigator.clipboard` 判断剪贴板能力

---

## ⚡ 六、注意事项

1. **安全与隐私**

   - 某些属性可能受浏览器隐私设置影响（如 geolocation 需用户授权）

2. **兼容性**

   - `navigator.connection`、`clipboard` 等 API 不是所有浏览器都支持，需要判断：

```js
if (navigator.connection) { ... }
if (navigator.clipboard) { ... }
```

3. **只读**

   - 无法修改 `userAgent` 或 `platform` 等信息

---

## 🧠 七、总结

- `navigator` = 浏览器 & 设备信息集合 + 一些浏览器能力 API
- 常用功能：

  1. **浏览器 / 语言 /平台信息** → UA 判断、国际化
  2. **网络信息** → 弱网检测、优化资源加载
  3. **设备信息** → 性能优化
  4. **能力检测** → 剪贴板、定位、发送统计

> 🔑 核心思想：通过 `navigator` 获取环境信息，根据环境动态调整前端行为，提高性能和用户体验。

---

我可以帮你画一张 **navigator 属性和方法体系图**，清晰展示 **浏览器信息、网络、设备、能力 API** 的分类和用途，非常直观。

你希望我画吗？

# 测试手段

# 单元测试

好的，我们来系统介绍一下 **单元测试（Unit Testing）**，这是前端和后端开发中非常核心的测试方法。

---

## 🧩 一、什么是单元测试

- **定义**：单元测试是对 **最小可测试单元** 的功能进行验证的测试方法。

  - “最小可测试单元”通常是 **函数、类、方法或组件**。

- **目的**：确保每个单元按照预期行为工作，发现早期错误，提高代码质量和可维护性。

> 单元测试只关注 **单个模块本身**，不依赖外部系统（如数据库、网络请求等）。

---

## 🏗️ 二、特点

1. **自动化**：可以通过测试框架自动执行
2. **隔离性**：测试单元独立，不依赖其他模块
3. **快速**：执行速度快，便于频繁回归测试
4. **可复现**：测试结果可重复，不受外部环境影响

---

## 🏷️ 三、为什么要做单元测试

1. **提前发现 bug**：尽早发现逻辑错误
2. **重构安全**：修改代码时不破坏已有功能
3. **提高可维护性**：文档化函数行为，便于团队协作
4. **持续集成**：与 CI/CD 集成，实现自动化回归

---

## 🏗️ 四、单元测试工具

- **JavaScript/TypeScript**：

  - [Jest](https://jestjs.io/)（Facebook 官方推荐，集成断言、Mock）
  - [Mocha](https://mochajs.org/) + [Chai](https://www.chaijs.com/)
  - [Vitest](https://vitest.dev/)（Vite 生态，速度快）

- **React 组件测试**：

  - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
  - Enzyme（旧方案，不推荐新项目）

---

## 🏷️ 五、示例

### 1️⃣ 测试函数逻辑

```js
// math.js
export function add(a, b) {
  return a + b;
}

// math.test.js
import { add } from "./math";

test("adds 1 + 2 to equal 3", () => {
  expect(add(1, 2)).toBe(3);
});
```

### 2️⃣ 测试异步函数

```js
// api.js
export async function fetchData() {
  return Promise.resolve("Hello");
}

// api.test.js
import { fetchData } from "./api";

test("fetchData returns Hello", async () => {
  const data = await fetchData();
  expect(data).toBe("Hello");
});
```

### 3️⃣ 测试 React 组件

```jsx
// Button.jsx
export function Button({ label }) {
  return <button>{label}</button>;
}

// Button.test.jsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("renders button with label", () => {
  render(<Button label="Click Me" />);
  expect(screen.getByText("Click Me")).toBeInTheDocument();
});
```

---

## ⚡ 六、单元测试最佳实践

1. **小而独立**：每个测试只测试一个功能
2. **可复现**：不要依赖真实接口或随机值，可用 Mock
3. **快速执行**：避免耗时操作，保持测试快速
4. **可读性强**：测试描述清楚，像文档一样
5. **覆盖率合理**：核心逻辑和边界条件优先

---

## 🧠 七、总结

| 特点     | 单元测试                            |
| -------- | ----------------------------------- |
| 测试对象 | 最小单元（函数、类、组件）          |
| 依赖     | 尽量独立，使用 Mock 模拟外部依赖    |
| 执行速度 | 快，便于频繁运行                    |
| 目的     | 保证每个模块行为正确，降低 bug 风险 |

> 核心思想：**“保证每个小模块正确，组合起来整个应用才可靠”**

---

我可以帮你画一张 **单元测试流程图**，从 **编写测试 → 执行 → 断言 → 报告**，清楚显示开发与测试的关系，非常直观。

你希望我画吗？

# axios 常用配置

非常好 👍
`axios` 是前端最常用的 HTTP 请求库之一，理解常用配置对封装请求模块、处理统一错误、携带 Token 等非常关键。

下面我系统讲一下 **axios 常用配置项 + 实际使用示例 + 最佳实践** 👇

---

## ✅ 一、基础配置项（`axios.create`）

在项目中，我们通常不会直接用 `axios.get()` 或 `axios.post()`，
而是通过 `axios.create()` 创建一个实例：

```ts
import axios from "axios";

const request = axios.create({
  baseURL: "/api", // 基础请求路径
  timeout: 10000, // 超时时间（毫秒）
  headers: {
    // 默认请求头
    "Content-Type": "application/json",
  },
  withCredentials: false, // 是否跨域携带 cookie
});
```

### 常用配置项说明

| 配置项            | 说明                      | 示例值                                     |
| ----------------- | ------------------------- | ------------------------------------------ |
| `baseURL`         | 请求基础路径              | `'https://api.example.com'`                |
| `timeout`         | 请求超时时间（毫秒）      | `10000`                                    |
| `headers`         | 默认请求头                | `{ 'Authorization': 'Bearer xxx' }`        |
| `withCredentials` | 是否携带 cookie（跨域时） | `true / false`                             |
| `params`          | `GET` 请求的查询参数      | `{ id: 123 }`                              |
| `data`            | `POST` 请求的请求体       | `{ name: 'Tom' }`                          |
| `responseType`    | 响应类型                  | `'json' / 'blob' / 'arraybuffer' / 'text'` |
| `validateStatus`  | 自定义状态码校验          | `(status) => status < 400`                 |

---

## ✅ 二、请求与响应拦截器（核心用法）

拦截器是 axios 的灵魂，可以在请求前统一处理 token、在响应后统一处理错误。

```ts
request.interceptors.request.use(
  (config) => {
    // 在请求前统一添加 token
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => {
    // 根据后端约定格式统一处理
    if (response.data.code !== 0) {
      console.error("接口错误:", response.data.message);
      return Promise.reject(response.data);
    }
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      console.error("HTTP错误:", error.response.status);
    } else if (error.code === "ECONNABORTED") {
      console.error("请求超时");
    } else {
      console.error("网络错误:", error.message);
    }
    return Promise.reject(error);
  }
);
```

✅ 这样就可以在调用时直接得到业务数据：

```ts
const res = await request.get("/user");
// 不需要再手动取 res.data
```

---

## ✅ 三、不同请求方式的调用写法

```ts
// GET 请求
request.get("/users", { params: { page: 1, size: 10 } });

// POST 请求
request.post("/login", { username: "admin", password: "123" });

// PUT 请求
request.put("/user/1", { name: "Tom" });

// DELETE 请求
request.delete("/user/1");

// 并发请求
const [user, posts] = await Promise.all([
  request.get("/user/1"),
  request.get("/user/1/posts"),
]);
```

---

## ✅ 四、取消请求（防抖/竞态处理）

```ts
const controller = new AbortController();

request.get("/search", {
  params: { q: "hello" },
  signal: controller.signal,
});

// 中途取消
controller.abort();
```

✅ 用于场景：

- 输入搜索框时取消上一个请求；
- 路由切换时取消未完成请求。

---

## ✅ 五、上传与下载文件配置

### 🔹 上传文件

```ts
const formData = new FormData();
formData.append("file", file);

request.post("/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
  onUploadProgress: (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log("上传进度:", percent);
  },
});
```

### 🔹 下载文件

```ts
const res = await request.get("/file/download", { responseType: "blob" });
const url = window.URL.createObjectURL(res);
const a = document.createElement("a");
a.href = url;
a.download = "file.pdf";
a.click();
```

---

## ✅ 六、axios 默认配置修改（全局配置）

```ts
axios.defaults.baseURL = "/api";
axios.defaults.timeout = 10000;
axios.defaults.headers.common["Authorization"] = "Bearer token";
```

（但推荐使用实例化的 `axios.create()`，更灵活）

---

## ✅ 七、常用组合封装（建议项目中这样写）

👉 新建文件：`src/utils/request.ts`

```ts
import axios from "axios";

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code !== 0) {
      return Promise.reject(new Error(message));
    }
    return data;
  },
  (error) => Promise.reject(error)
);

export default request;
```

调用：

```ts
import request from "@/utils/request";

const user = await request.get("/user");
```

---

## ✅ 八、补充：常用高级配置

| 功能             | 配置项                         | 示例              |
| ---------------- | ------------------------------ | ----------------- |
| 请求取消         | `signal: AbortSignal`          | 防止重复请求      |
| 请求重试         | 自行封装或用插件 `axios-retry` | 重试机制          |
| 响应缓存         | 可用 `axios-cache-adapter`     | 加速重复请求      |
| 自定义参数序列化 | `paramsSerializer`             | 处理数组参数      |
| 自定义状态处理   | `validateStatus`               | 只处理 2xx 状态码 |

---

## 🧩 示例：带重试 + 错误提示的统一封装

```ts
import axios from "axios";
import { message } from "antd";

const request = axios.create({ baseURL: "/api", timeout: 8000 });

request.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    if (!error.config.__retryCount) error.config.__retryCount = 0;

    if (error.config.__retryCount < 2) {
      error.config.__retryCount += 1;
      return request(error.config); // 自动重试
    }

    message.error(error.response?.data?.message || "请求失败");
    return Promise.reject(error);
  }
);

export default request;
```

---

是否希望我帮你整理一个「企业级 axios 封装模板」？
包括：

- 统一错误提示；
- 请求节流/取消；
- 自动携带 token；
- 支持文件上传进度。

# 动画性能如何检测

# lodash.flattenDeep

非常好的问题 👏
**动画性能检测** 是前端性能优化中非常关键的一环，尤其是在你用 React Native、React Web、Canvas、SVG 或 CSS 动画时。
不管是页面掉帧（jank）、卡顿，还是 GPU 占用过高，都需要量化分析。

下面我给你系统介绍：
👉 **动画性能检测的常用指标、浏览器工具、框架辅助工具和优化方法**。

---

## 🧭 一、动画性能的关键指标

| 指标                                               | 含义                         | 理想值       |
| -------------------------------------------------- | ---------------------------- | ------------ |
| **FPS (Frames Per Second)**                        | 每秒渲染帧数                 | ≥ 60 FPS     |
| **Frame Time**                                     | 每帧耗时（16.6ms = 1000/60） | ≤ 16ms       |
| **CPU/GPU 占用**                                   | 渲染计算与绘制开销           | 越低越好     |
| **Recalculate Style / Layout / Paint / Composite** | 浏览器渲染管线的各阶段耗时   | 尽量减少     |
| **JS 线程阻塞时间**                                | 动画期间 JS 主线程占用       | 尽量低       |
| **Memory 使用**                                    | 动画中内存分配/释放频率      | 稳定、无泄漏 |

---

## 🧩 二、在浏览器中检测动画性能

### ✅ 1. **Chrome DevTools - Performance 面板（最强推荐）**

这是分析 CSS / JS / Canvas / WebGL 动画性能的标准工具。

**使用方法：**

1. 打开 DevTools → “Performance”；
2. 点击 “Record” 按钮；
3. 执行动画（滚动、播放动画等）；
4. 停止录制。

**看点：**

- 🟩 **FPS 图**：绿色条越密集越流畅；
- 🟦 **Main thread**：显示 JS 执行、样式计算、绘制时间；
- 🟪 **Paint / Composite Layers**：标出重绘和重组位置；
- 🟧 **GPU / Rasterize**：可视化 GPU 绘制；
- 🔍 可点击任意帧查看耗时详情。

**重点关注：**

- 是否频繁触发 **Recalculate Style**；
- 是否频繁 **Layout / Paint**；
- 是否存在长耗时 JS 阻塞（超过 50ms 的黄色块）；
- 是否掉帧（FPS 低于 60）。

---

### ✅ 2. **Chrome DevTools - Rendering 面板**

打开路径：
**DevTools → Command Menu → “Show Rendering”**

开启以下选项可直观看出动画问题：

| 功能                      | 作用                                       |
| ------------------------- | ------------------------------------------ |
| ✅ “Paint flashing”       | 高亮重绘区域（可直观看出哪些元素频繁重绘） |
| ✅ “FPS meter”            | 右上角显示实时帧率                         |
| ✅ “Layout Shift Regions” | 检测布局跳动（layout shift）               |
| ✅ “Layer Borders”        | 显示合成层边界（帮助识别 GPU 加速情况）    |

👉 如果动画掉帧明显，可以看到 Paint 频繁闪烁、FPS 低于 60。

---

### ✅ 3. **Chrome DevTools - Layers 面板**

用于分析哪些元素被提升为 GPU 合成层（Composited Layer）。

- 动画时应确保变换属性（如 `transform`, `opacity`）能在单独层中渲染；
- 避免在主线程上反复触发 reflow。

---

## 🧠 三、JS 动画性能检测（代码层）

### 1️⃣ 使用 `Performance API`

可以直接测量动画函数或渲染逻辑的耗时。

```js
performance.mark("start");
doAnimationStep();
performance.mark("end");
performance.measure("frame", "start", "end");

const measure = performance.getEntriesByName("frame")[0];
console.log("Frame time:", measure.duration);
```

或统计平均 FPS：

```js
let last = performance.now();
let frames = 0;

function loop() {
  frames++;
  const now = performance.now();
  if (now - last >= 1000) {
    console.log("FPS:", frames);
    frames = 0;
    last = now;
  }
  requestAnimationFrame(loop);
}
loop();
```

---

### 2️⃣ 使用 `requestAnimationFrame` 统计掉帧率

```js
let last = performance.now();
let count = 0;

function checkFPS() {
  const now = performance.now();
  count++;
  if (now - last >= 1000) {
    console.log(`FPS: ${count}`);
    count = 0;
    last = now;
  }
  requestAnimationFrame(checkFPS);
}
checkFPS();
```

如果 FPS 长期 < 55，就说明动画卡顿。

---

## 📱 四、在 React Native 中检测动画性能

React Native 提供了内建性能工具：

### ✅ 1. 开启 FPS 指标显示

在模拟器或真机中打开：

```bash
Cmd + D → Show Perf Monitor
```

会显示：

- JS FPS（JavaScript 主线程帧率）
- UI FPS（UI 渲染线程帧率）

👉 如果 UI FPS < 60 或 JS FPS < 55，就存在掉帧或计算瓶颈。

### ✅ 2. 使用 `react-native-performance` 或 `why-did-you-render`

这些库可以帮你检测：

- 哪些组件频繁重新渲染；
- 渲染耗时；
- Reanimated 动画的性能。

---

## 💻 五、框架层性能分析（React / Vue）

### React 开发者工具 → Profiler

可以分析动画过程中：

- 哪些组件重复渲染；
- 每次渲染耗时；
- 哪些 state 更新触发渲染。

动画如果是基于 state 更新（而非 transform），就可能造成性能问题。
例如：

```tsx
const [x, setX] = useState(0);
useEffect(() => {
  const id = setInterval(() => setX((v) => v + 1), 16);
  return () => clearInterval(id);
}, []);
```

⚠️ 这会导致每帧 React 重新渲染 → 性能灾难。

应改为：

```tsx
<div style={{ transform: `translateX(${x}px)` }} />
```

或使用 CSS Transition / Reanimated / Framer Motion。

---

## 🧩 六、第三方性能分析工具

| 工具                   | 说明                                         |
| ---------------------- | -------------------------------------------- |
| **Stats.js**           | 实时显示 FPS/内存占用                        |
| **GSAP LagSmoothing**  | GSAP 内置的帧率平滑工具                      |
| **Perfume.js**         | 性能指标采集工具（包括 FPS、First Paint 等） |
| **React Profiler API** | 记录渲染时间和原因                           |
| **Web Vitals**         | 更高层级性能监控（LCP/FID/CLS）              |

---

## 🚀 七、动画性能优化方向（总结）

| 问题         | 原因                          | 优化手段                                      |
| ------------ | ----------------------------- | --------------------------------------------- |
| 动画掉帧     | 主线程阻塞                    | 使用 `transform` / `opacity`，开启 GPU 合成层 |
| 重绘频繁     | 修改 `top/left`、颜色、阴影等 | 尽量使用 `transform` 替代 layout              |
| 帧率波动     | JS 计算过多                   | 使用 `requestAnimationFrame` 节流             |
| 渲染卡顿     | DOM 数量大                    | 使用虚拟滚动、减少 DOM 层级                   |
| React 重渲染 | 状态更新过于频繁              | 使用 `memo` / `useMemo` / 动画库              |
| GPU 压力大   | 同时绘制层太多                | 合理合层、减少透明层叠                        |

---

## 🎯 推荐检测组合

| 平台         | 检测工具                           | 目标       |
| ------------ | ---------------------------------- | ---------- |
| Web          | Chrome Performance + Rendering     | 帧率、重绘 |
| React        | React Profiler + Performance Panel | 渲染性能   |
| React Native | Perf Monitor / Flipper             | JS/UI FPS  |
| Canvas       | Stats.js + Performance API         | 绘制性能   |
| 生产环境     | Web Vitals / Perfume.js            | 实时监控   |

---

是否希望我帮你整理一个「动画性能检测 + 优化 checklist」？
包含 **检测 → 分析 → 优化** 的完整流程（适合放在前端性能文档里）。

# input

非常好的问题 👍
`<input>` 是前端表单中最基础、也是最常用的元素之一。
它的“使用场景”非常广泛，几乎所有需要**用户输入、交互、过滤或编辑数据**的地方都离不开它。
下面我来系统地帮你分类讲一下 👇

---

## 🧩 一、基本输入场景（text 系列）

最常见的就是普通文本输入。

| 类型       | 示例                        | 使用场景                             |
| ---------- | --------------------------- | ------------------------------------ |
| `text`     | `<input type="text" />`     | 用户名、搜索框、备注输入等通用文本   |
| `password` | `<input type="password" />` | 登录注册密码输入                     |
| `email`    | `<input type="email" />`    | 邮箱输入（带格式校验）               |
| `tel`      | `<input type="tel" />`      | 手机号输入（移动端自动调出数字键盘） |
| `url`      | `<input type="url" />`      | 网站地址输入（可自动校验格式）       |
| `search`   | `<input type="search" />`   | 搜索框（部分浏览器自动带清除按钮）   |

> ✅ **注意：** > `email`、`url`、`tel` 在移动端尤其有用，会自动唤起对应的键盘样式。

---

## 🔢 二、数值与选择场景

| 类型                                 | 示例                                        | 使用场景                                 |
| ------------------------------------ | ------------------------------------------- | ---------------------------------------- |
| `number`                             | `<input type="number" min="0" max="100" />` | 数量、价格、分数输入等需要数值范围的场景 |
| `range`                              | `<input type="range" min="0" max="100" />`  | 滑动条调节音量、亮度、进度等             |
| `checkbox`                           | `<input type="checkbox" />`                 | 多选项（兴趣标签、设置选项）             |
| `radio`                              | `<input type="radio" name="gender" />`      | 单选项（性别、类型选择）                 |
| `color`                              | `<input type="color" />`                    | 颜色选择器                               |
| `select`（虽不是 input，但常一起用） | `<select><option>选项</option></select>`    | 下拉选择                                 |

---

## 📅 三、时间类输入

| 类型             | 示例                              | 使用场景                   |
| ---------------- | --------------------------------- | -------------------------- |
| `date`           | `<input type="date" />`           | 选择日期（生日、出发日期） |
| `time`           | `<input type="time" />`           | 选择时间（闹钟、会议时间） |
| `datetime-local` | `<input type="datetime-local" />` | 日期 + 时间输入            |
| `month`          | `<input type="month" />`          | 选择月份（账单周期）       |
| `week`           | `<input type="week" />`           | 选择周数（周报选择）       |

> ✅ 现代浏览器原生支持这些控件，会自动渲染日历或时间选择界面。

---

## 🖼️ 四、文件与媒体输入

| 类型            | 示例                                     | 使用场景                      |
| --------------- | ---------------------------------------- | ----------------------------- |
| `file`          | `<input type="file" />`                  | 上传文件（图片、PDF、视频等） |
| `file multiple` | `<input type="file" multiple />`         | 支持多文件上传                |
| `accept` 属性   | `<input type="file" accept="image/*" />` | 限制上传文件类型              |

---

## 📱 五、系统与交互类输入

| 类型     | 示例                                      | 使用场景                     |
| -------- | ----------------------------------------- | ---------------------------- |
| `hidden` | `<input type="hidden" value="user_id" />` | 隐藏数据传递（提交表单附带） |
| `submit` | `<input type="submit" />`                 | 表单提交按钮                 |
| `reset`  | `<input type="reset" />`                  | 表单重置                     |
| `button` | `<input type="button" value="点击" />`    | 自定义按钮（不提交）         |
| `image`  | `<input type="image" src="submit.png" />` | 图片形式的提交按钮           |

---

## 🧠 六、配合 JS 的常见使用场景

| 场景                     | 示例 / 说明                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| ✅ **搜索输入**          | 实时监听输入变化：`onChange` + 防抖（如搜索建议）                        |
| 🧩 **动态表单**          | 多个 `<input>` 组成数据结构（如动态添加输入项）                          |
| 🧾 **验证输入**          | `pattern` + `required` + JS 校验（手机号、邮箱格式）                     |
| 🔍 **过滤器 / 筛选条件** | 如商品列表筛选区                                                         |
| 📷 **图片上传**          | `<input type="file" accept="image/*" capture="camera" />` 可直接拍照上传 |
| 🖊️ **可编辑区域**        | 结合 CSS 伪元素或内联编辑实现“点击修改”功能                              |
| ⌨️ **输入法兼容**        | 监听 `compositionstart` / `compositionend` 防止中文输入冲突              |

---

## 🧰 七、开发建议

- ✅ 用 `value + onChange` 控制（受控组件）；
- ✅ 使用 `placeholder` 提示用户；
- ✅ 对需要输入的场景添加 `aria-label` 以提高无障碍性；
- 🚫 不推荐滥用 `contenteditable` 替代 `<input>`；
- ⚡ 对性能敏感的实时输入，用防抖（`lodash.debounce`）优化。

---

## 🧾 实战例子：搜索输入框

```tsx
import { useState } from "react";

export default function SearchInput() {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <input
      type="search"
      placeholder="搜索内容..."
      value={value}
      onChange={handleChange}
      style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
    />
  );
}
```

---

是否希望我帮你列出 **Ant Design 中 `<Input>` 组件** 的常用类型与使用场景对照表？（如 `Input.Password`、`Input.Search`、`Input.TextArea` 等）

# 静态资源预加载

# websocket

# eslint

# vite 预构建

# 高阶组件 HOC

# 判断设备

## navigator.userAgent

## window.innerWidth

## 媒体查询 window.matchMedia()

# 退出浏览器之间，发送积压的埋点数据请求

## navigator.sendBeacon()

## fetch() API 的 keepalive

# -webkit-xxx

# ResizeObserver

# git bisect

# Dom 快照录制

Dom 快照录制-rrweb 库是目前最为流行的解决方案，一些商业化平台解决方案也都主要基于 rrweb 库来进行录制与回放的功能开发。

# window.getSelection () ;

# px 如何转为 rem

- postcss-pxtorem
- 编写脚本进行转换

# 浏览器有同源策略，但是为何 cdn 请求资源的时候不会有 跨域限制

# cookie 可以实现不同域共享吗

# 判断一个对象是否为空，包含了其原型链上是否有自定义 数据或者方法

# js 如何判空? 「空」包含了:空数组、空对象、空字符 串、0、undefined、null、空 map、空 set ，都属于为空的数据

# 微前端

## JavaScript Sandboxing

## Webpack 的模块联邦

# 设计一套前端全站请求耗时统计工具

# cookie

# 函数式编程
