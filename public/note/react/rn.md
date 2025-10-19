# 工作原理

React Native 是由 Meta（前 Facebook）开发的开源框架，允许开发者使用 JavaScript 和 React 构建跨平台的原生应用。 其核心理念是通过 JavaScript 编写逻辑和 UI，最终在 Android 和 iOS 上渲染为原生组件。([reactnative.cn][1], [CSDN][2])

---

## 🧠 React Native 的核心架构

### 1. JavaScript 线程（JS Thread）

负责执行开发者编写的 JavaScript 代码，包括业务逻辑、状态管理和 UI 描述。

### 2. 原生线程（Native Thread）

负责渲染原生 UI 组件、处理手势、动画等平台特定的操作。

### 3. 通信机制

- **旧架构（Bridge）**：JavaScript 与原生模块之间通过异步的 Bridge（桥接）通信，数据需序列化后传递。

- **新架构（JSI）**：引入 JavaScript Interface（JSI），允许 JavaScript 和原生代码之间进行同步通信，提高了性能和响应速度。

---

## 🏗️ 渲染流程

1. **React 组件构建虚拟 DOM**：开发者使用 JSX 编写组件，React 构建出虚拟 DOM（Virtual DOM）。([CSDN][2])

2. **差异计算（Diffing）**：React 比较新旧虚拟 DOM，找出需要更新的部分。([CSDN][2])

3. **UI 更新**：通过通信机制（Bridge 或 JSI）将更新信息传递给原生线程，原生线程根据这些信息更新 UI。([CSDN][2])

---

## 🚀 新架构的优势

React Native 的新架构引入了多项改进，提升了性能和开发体验：

- **Fabric 渲染器**：新的渲染系统，支持同步渲染，提升了 UI 的响应速度。

- **TurboModules**：优化了原生模块的加载和调用，减少了启动时间。

- **Codegen**：通过静态类型分析，自动生成原生模块的绑定代码，减少了手动编码的工作量。

---

## 🔍 总结

React Native 通过将 JavaScript 编写的逻辑和 UI 描述转化为原生组件，实现了跨平台的开发能力。 随着新架构的引入，性能和开发体验得到了显著提升。

如果您对某一部分（如通信机制、渲染流程或新架构的具体实现）感兴趣，欢迎继续提问，我将为您提供更深入的解答。

[1]: https://reactnative.cn/docs/intro-react-native-components?utm_source=chatgpt.com "核心组件与原生组件 - React Native 中文网"
[2]: https://blog.csdn.net/gtLBTNq9mr3/article/details/132331546?utm_source=chatgpt.com "React-Native 的渲染原理是什么？ 转载 - CSDN博客"

# 架构

React Native 的架构经历了从旧版 Bridge 架构到新版 Fabric 架构的重大演进。以下是两个架构的发布版本及其关键特性：

---

## 🔗 旧版 Bridge 架构

- **首次引入版本**：React Native 0.1（2015 年 3 月）
- **核心机制**：JavaScript 与原生模块之间通过异步的 Bridge（桥接）通信，数据需序列化后传递。
- **主要特点**：

  - 通信为异步，可能导致性能瓶颈。
  - 存在线程切换和消息队列延迟。
  - 调试和错误追踪相对复杂。

---

## 🧱 新版 Fabric 架构

- **实验性引入版本**：React Native 0.68（2022 年 3 月）&#x20;
- **默认启用版本**：React Native 0.76（2024 年 10 月）&#x20;
- **核心组件**：
  - **JSI（JavaScript Interface）**：替代 Bridge，实现更高效的同步通信。
  - **TurboModules**：优化原生模块的加载和调用。
  - **Fabric Renderer**：全新的渲染系统，提升 UI 性能。
  - **Bridgeless 模式**：完全移除传统 Bridge，进一步减少通信开销。([React Native][1], [React Native][2])

---

## 📌 总结对比

| 架构类型    | 引入版本     | 默认启用版本 | 通信机制    | 渲染系统        | 性能表现 |                                                                        |
| ----------- | ------------ | ------------ | ----------- | --------------- | -------- | ---------------------------------------------------------------------- |
| Bridge 架构 | 0.1          | 0.1          | 异步 Bridge | 传统渲染系统    | 一般     |                                                                        |
| Fabric 架构 | 0.68（实验） | 0.76         | 同步 JSI    | Fabric Renderer | 显著提升 | ([React Native][3], [React Native][4], [React Native][5], [Medium][6]) |

---

如果您正在考虑升级项目或了解更多关于新架构的迁移路径和兼容性信息，欢迎继续提问，我将为您提供详细的指导和建议。

[1]: https://reactnative.dev/blog/2022/03/15/an-update-on-the-new-architecture-rollout?utm_source=chatgpt.com "An update on the New Architecture Rollout - React Native"
[2]: https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here?utm_source=chatgpt.com "New Architecture is here - React Native"
[3]: https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture?utm_source=chatgpt.com "New Architecture by default, React Native DevTools, and more"
[4]: https://reactnative.dev/architecture/fabric-renderer?utm_source=chatgpt.com "Fabric - React Native"
[5]: https://reactnative.dev/architecture/landing-page?utm_source=chatgpt.com "About the New Architecture - React Native"
[6]: https://medium.com/%40DhruvHarsora/deep-dive-into-react-natives-new-architecture-jsi-turbomodules-fabric-yoga-234bbdf853b4?utm_source=chatgpt.com "Deep Dive into React Native's New Architecture: JSI, TurboModules ..."

# JavaScript 引擎

在 React Native 中，JavaScript 引擎负责执行 JavaScript 代码。目前，主要有两种引擎可供选择：JavaScriptCore（JSC）和 Hermes。以下是对这两种引擎的详细介绍和比较：

---

## 🧠 JavaScriptCore（JSC）

**概述**：JSC 是由 Apple 开发的 JavaScript 引擎，主要用于 Safari 浏览器。在 React Native 中，JSC 曾是默认的 JavaScript 引擎。([DEV Community][1])

**特点**：

- **跨平台支持**：在 iOS 上，React Native 使用系统自带的 JSC；在 Android 上，React Native 使用内置的 JSC。

- **JIT 编译**：JSC 使用即时编译（Just-In-Time, JIT）技术，将 JavaScript 代码在运行时编译为机器码，以提高执行效率。

- **内存使用**：由于 JIT 编译的特性，JSC 在某些情况下可能会占用更多的内存。

**当前状态**：

- 从 React Native 0.79 开始，JSC 被迁移到社区维护的独立包 `@react-native-community/javascriptcore`，以便更灵活地更新和维护。 ([Medium][2])

---

## ⚙️ Hermes

**概述**：Hermes 是由 Meta（前 Facebook）开发的开源 JavaScript 引擎，专为优化 React Native 应用的性能而设计。

**特点**：

- **AOT 编译**：Hermes 使用预先编译（Ahead-of-Time, AOT）技术，在构建时将 JavaScript 编译为字节码，减少了应用启动时的编译开销。

- **更快的启动时间**：由于采用 AOT 编译，Hermes 可以显著提升应用的启动速度。

- **更小的应用体积**：Hermes 生成的字节码更紧凑，有助于减小 APK 或 IPA 的大小。

- **更低的内存占用**：优化的垃圾回收机制（如 Hades GC）减少了内存使用，提升了应用的稳定性。

**当前状态**：

- 从 React Native 0.70 开始，Hermes 成为默认的 JavaScript 引擎。&#x20;

- 在 Expo SDK 46（对应 React Native 0.69）及更高版本中，Hermes 也被默认启用。&#x20;

---

## 🆚 JSC 与 Hermes 的比较

| 特性         | JavaScriptCore (JSC) | Hermes                   |                                                       |
| ------------ | -------------------- | ------------------------ | ----------------------------------------------------- |
| 编译方式     | JIT 编译             | AOT 编译                 |                                                       |
| 启动时间     | 相对较慢             | 更快                     |                                                       |
| 应用体积     | 较大                 | 更小                     |                                                       |
| 内存占用     | 较高                 | 更低                     |                                                       |
| 默认引擎版本 | 早期 React Native    | React Native 0.70 及以上 |                                                       |
| 维护方式     | 社区维护             | Meta 官方维护            | ([Medium][3], [Creole Studios][4], [React Native][5]) |

---

## ✅ 如何选择

- **选择 Hermes**：如果您希望应用具有更快的启动速度、更小的体积和更低的内存占用，建议使用 Hermes。

- **选择 JSC**：如果您的应用依赖于某些在 Hermes 中尚未完全支持的特性，或者在特定平台上需要使用 JSC，您可以选择使用 JSC。

---

如果您需要了解如何在项目中启用或切换 JavaScript 引擎，或者在集成过程中遇到问题，欢迎继续提问，我将为您提供进一步的帮助。

[1]: https://dev.to/nour_abdou/react-native-under-the-hood-how-your-js-ios-and-android-code-run-together-3k2e?utm_source=chatgpt.com "React Native Under the Hood: How Your JS, iOS, and Android Code ..."
[2]: https://medium.com/%40onix_react/release-react-native-0-79-1087f4fd1f7e?utm_source=chatgpt.com "Release React Native 0.79 - Medium"
[3]: https://balevdev.medium.com/understanding-javascript-engines-a-dive-into-hermes-webkit-and-v8-59f9d8529fae?utm_source=chatgpt.com "Understanding JavaScript Engines: A Dive into Hermes, WebKit ..."
[4]: https://www.creolestudios.com/react-native-0-79-update-highlights/?utm_source=chatgpt.com "What's New in React Native 0.79? - Creole Studios"
[5]: https://reactnative.dev/blog/2022/07/08/hermes-as-the-default?utm_source=chatgpt.com "Hermes as the Default - React Native"

# JSI

在 React Native 的新架构中，**JSI（JavaScript Interface）** 是连接 JavaScript 与原生代码（C++）的关键接口，旨在提升性能、简化通信，并增强引擎的灵活性。

---

## 🔍 什么是 JSI？

JSI 是一个用 C++ 编写的轻量级接口，允许 JavaScript 引擎（如 Hermes、V8、JavaScriptCore）与原生代码进行高效的双向通信。它通过提供统一的 API，使得 JavaScript 可以直接调用原生模块，反之亦然，摆脱了传统 Bridge 模式下的 JSON 序列化和异步通信的限制。

---

## ⚙️ JSI 的工作原理

### 1. 双向引用与调用

JSI 允许 JavaScript 对象持有对 C++ 对象的引用，反之亦然。这意味着：([reactnative.cn][1])

- JavaScript 可以直接调用原生模块的方法，无需通过中间桥接层。

- 原生代码可以直接调用 JavaScript 函数，实现更紧密的集成。

这种设计提高了通信效率，减少了延迟。

### 2. 同步通信与懒加载

在传统的 Bridge 架构中，通信通常是异步的，可能导致性能瓶颈。而 JSI 支持同步通信，使得某些操作可以立即执行，提升了响应速度。

此外，JSI 支持原生模块的懒加载，即在需要时才加载模块，减少了应用的初始加载时间。

---

## 🚀 JSI 的优势

- **高性能**：通过同步通信和直接调用，减少了延迟，提高了性能。

- **灵活性**：支持多种 JavaScript 引擎（Hermes），使得开发者可以根据需要选择合适的引擎。

- **简化通信**：摆脱了传统 Bridge 的 JSON 序列化和异步通信的复杂性。([vivo 快应用官方博客][2])

- **模块化**：支持原生模块的懒加载，优化了资源使用。

---

## 🧱 JSI 与 React Native 新架构的关系

JSI 是 React Native 新架构的核心组成部分，与其他模块协同工作：([maxiee.github.io][3])

- **TurboModules**：利用 JSI 实现高效的原生模块系统，支持同步调用和懒加载。

- **Fabric**：新的 UI 渲染系统，使用 JSI 实现 JavaScript 与原生 UI 组件之间的高效通信。

- **Codegen**：通过静态类型分析，自动生成原生模块的绑定代码，减少了手动编码的工作量。

这些模块共同构建了 React Native 的新架构，提升了性能和开发体验。

---

## 📚 进一步学习资源

- **React Native 官方文档**：[React Native 新架构](https://reactnative.cn/docs/0.77/the-new-architecture/why)([reactnative.cn][1])

- **深入理解 JSI**：[React Native JSI：实现 RN 与原生通信](https://juejin.cn/post/6999432558366703630)([掘金][4])

- **JSI 模块开发模板**：[react-native-jsi-template](https://gitcode.com/gh_mirrors/re/react-native-jsi-template)([CSDN][5])

如果您希望了解如何在项目中使用 JSI 开发原生模块，或在集成过程中遇到问题，欢迎继续提问，我将为您提供详细的指导。

[1]: https://reactnative.cn/docs/0.77/the-new-architecture/why?utm_source=chatgpt.com "为何要设计新架构 - React Native 中文网"
[2]: https://quickapp.vivo.com.cn/react/?utm_source=chatgpt.com "从react-native的js和native通讯看看JSI是什么 - vivo 快应用官方博客"
[3]: https://maxiee.github.io/post/ReactNativeTheNewArchitecture2md/?utm_source=chatgpt.com "React Native 的新架构介绍（二）：JSI 和JSC | Maxiee Blog"
[4]: https://juejin.cn/post/6999432558366703630?utm_source=chatgpt.com "React Native JSI：实现RN与原生通信 - 稀土掘金"
[5]: https://blog.csdn.net/gitblog_00064/article/details/139571853?utm_source=chatgpt.com "探索React Native的JSI世界：react-native-jsi-template-CSDN博客"

# webview

非常好 👍 — 这是 React Native 中非常常见、又容易被误解的组件。
我们来系统讲清楚 **React Native WebView** 的作用、原理、通信机制、性能特点和典型应用场景。

---

## 🧩 一、什么是 WebView

**WebView** 是 React Native 用来在原生 App 内部嵌入一个“网页容器”的组件。
简单理解：它就是一个「App 内置浏览器」，可以在 React Native 中渲染 HTML、运行 JS、加载网页资源。

在 React Native 中使用：

```tsx
import { WebView } from "react-native-webview";

<WebView source={{ uri: "https://example.com" }} />;
```

> 目前 WebView 已不再内置在 React Native 主包中，而是独立维护的社区包：
> 📦 [`react-native-webview`](https://github.com/react-native-webview/react-native-webview)

---

## ⚙️ 二、底层实现原理

React Native 的 WebView 是对各平台原生 WebView 的封装：

| 平台              | 使用的原生控件                            |
| ----------------- | ----------------------------------------- |
| **iOS**           | `WKWebView`（现代版 Safari 引擎）         |
| **Android**       | `android.webkit.WebView`（基于 Chromium） |
| **Windows/macOS** | 对应平台的原生浏览器引擎控件              |

React Native 层仅做了以下事情：

- 将 props 转换为原生控件的配置；
- 监听事件（如加载状态、错误、导航变化）；
- 提供 **JS 与原生通信桥（Bridge）**；
- 允许注入自定义 JS/CSS。

---

## 🌐 三、基本用法

### 1️⃣ 加载网页

```tsx
<WebView source={{ uri: "https://reactnative.dev/" }} />
```

### 2️⃣ 加载本地 HTML

```tsx
const html = `<h1>Hello from HTML</h1>`;
<WebView source={{ html }} />;
```

### 3️⃣ 加载本地文件

```tsx
<WebView source={require("./assets/local.html")} />
```

---

## 🔁 四、通信机制（JS ↔ RN）

WebView 最大的亮点是它允许 **双向通信**：

### 1️⃣ JS → RN：通过 `window.ReactNativeWebView.postMessage`

在网页中（HTML 内）：

```html
<script>
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ action: "login", token: "abc" })
  );
</script>
```

React Native 侧接收：

```tsx
<WebView
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log("来自网页的数据：", data);
  }}
/>
```

### 2️⃣ RN → JS：通过 `injectJavaScript()` 或 `injectedJavaScript`

```tsx
const webviewRef = useRef(null);

<WebView
  ref={webviewRef}
  source={{ uri: 'https://example.com' }}
/>

<Button
  title="向网页发送消息"
  onPress={() => {
    webviewRef.current?.injectJavaScript(`
      alert('Hello from React Native');
      true;
    `);
  }}
/>
```

💡 `injectedJavaScript` 是在网页加载完成时自动执行的脚本；
`injectJavaScript()` 是在任意时刻动态注入。

---

## 🧭 五、常见事件

| 事件名                         | 说明                                 |
| ------------------------------ | ------------------------------------ |
| `onLoadStart`                  | 网页开始加载                         |
| `onLoadProgress`               | 加载进度（0~1）                      |
| `onLoadEnd`                    | 加载结束（成功/失败）                |
| `onError`                      | 加载失败                             |
| `onNavigationStateChange`      | 地址或标题变化                       |
| `onMessage`                    | 网页通过 postMessage 发送数据        |
| `onShouldStartLoadWithRequest` | 拦截导航（返回 true/false 控制跳转） |

示例：

```tsx
<WebView
  onNavigationStateChange={(navState) => {
    console.log("当前 URL:", navState.url);
  }}
  onShouldStartLoadWithRequest={(req) => {
    if (req.url.startsWith("https://forbidden.com")) return false;
    return true;
  }}
/>
```

---

## ⚡ 六、性能与注意事项

| 方面           | 建议                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| **加载性能**   | 预加载 HTML / 缓存静态资源 / 使用 gzip 压缩                                      |
| **内存**       | 避免频繁创建销毁 WebView；可在 Tab 中复用实例                                    |
| **安全性**     | 仅允许受信任的 URL；避免执行未知 JS                                              |
| **交互体验**   | 用原生组件（例如下拉刷新、加载进度条）增强体验                                   |
| **调试**       | iOS：Safari → 开发 → WebView 调试；Android：Chrome DevTools → `chrome://inspect` |
| **桥性能限制** | JS <-> RN 通信频繁会造成性能瓶颈（建议节流或批量通信）                           |

---

## 🧩 七、典型应用场景

| 场景                        | 描述                                       |
| --------------------------- | ------------------------------------------ |
| **嵌入 H5 页面**            | 常用于混合开发（Hybrid App）               |
| **展示富文本内容**          | Markdown / 富文本编辑结果                  |
| **加载第三方页面**          | 例如支付页、授权页、帮助中心               |
| **小程序容器 / Web 工具页** | 内部快速加载 Web 工具或表单页              |
| **渐进式迁移**              | 从 H5 逐步迁到 RN 时，部分页面仍用 WebView |

---

## 🔐 八、安全建议

1. 禁止加载外部不可信的 JS；
2. 不暴露敏感数据给网页；
3. 使用 HTTPS；
4. 若加载本地文件，设置 `originWhitelist={['*']}` 时需谨慎；
5. 对所有消息通信进行 JSON 格式校验。

---

## 🧱 九、扩展：高级用法

- **`startInLoadingState` + `renderLoading`**：自定义加载中动画
- **`injectedJavaScriptBeforeContentLoaded`**：在 DOMContentLoaded 前注入 JS
- **`mediaPlaybackRequiresUserAction={false}`**：自动播放视频
- **`allowFileAccess` / `allowUniversalAccessFromFileURLs`**：控制文件访问安全
- **`pullToRefreshEnabled`**（Android）支持下拉刷新

---

## 🧭 十、总结一句话

> ✅ **React Native WebView = 原生 WebView 的统一封装 + JS 通信桥**
> 它让你在 RN 中嵌入网页，同时与网页进行双向交互，是 Hybrid App 的核心组件。

---

如果你愿意，我可以帮你写一个实际示例：
📱“React Native WebView 调用网页函数 & 网页反调 RN 的完整双向通信示例”。

是否需要我帮你写一个这样的 demo？
