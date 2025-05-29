# Fiber

# 虚拟列表

# 版本更新

截至 2025 年，React 的两个重要版本更新是 **React 18** 和 **React 19**，它们分别于 2022 年和 2024 年发布。以下是这两个版本的主要特性和更新：

---

## 🔄 React 18（发布于 2022 年 3 月）

React 18 引入了新的并发渲染引擎，旨在提升性能和用户体验。

### 主要特性：

- **并发渲染（Concurrent Rendering）**：允许 React 更灵活地中断和恢复渲染任务，提高应用响应速度。

- **自动批处理（Automatic Batching）**：自动将多个状态更新合并为一次渲染，减少不必要的更新次数。([Webkul Software][1])

- **startTransition API**：用于标记非紧急的 UI 更新，使 React 能够优先处理高优先级的更新。([kellton.com][2])

- **服务端渲染支持 Suspense**：增强了服务端渲染的能力，支持在服务端使用 Suspense 进行数据加载。

- **新的钩子函数**：引入了一些新的 Hook，如 `useId`，用于生成唯一的 ID，解决服务端和客户端渲染不一致的问题。

这些特性使得 React 应用在性能和用户体验方面有了显著提升。

---

## 🚀 React 19（发布于 2024 年 12 月） [->](https://zh-hans.react.dev/blog/2024/12/05/react-19)

React 19 是一次重大更新，引入了多个新特性和改进，进一步提升了开发效率和应用性能。

### 主要特性：

- **Server Components**：允许在服务端渲染组件，减少客户端的 JavaScript 负载，提高初始加载速度。

  - 流式渲染（Streaming SSR）
    React 19 默认启用了流式渲染，允许服务器在生成 HTML 内容的同时，将其逐步发送给客户端。这意味着用户可以更快地看到页面内容，减少了首次内容绘制（First Contentful Paint, FCP）的时间，提升了用户体验。

  - React Server Components（RSC）
    React 19 引入了 React Server Components（RSC），这是一种在服务器上渲染组件的新方式。与传统的 SSR 不同，RSC 将组件渲染为序列化的结构，而不是完整的 HTML。这些序列化的组件在客户端被解析并渲染，无需进行水合（hydration）过程，从而减少了客户端的 JavaScript 负载，提升了性能。

  - Server Actions
    React 19 推出了 Server Actions，允许开发者在服务器上处理用户交互和状态更新，而无需为每个操作创建单独的 API 端点。这简化了数据处理流程，减少了客户端与服务器之间的通信，提高了开发效率。

- **新指令：`'use client'` 和 `'use server'`**：用于明确指定组件或函数的运行环境，增强了代码的可读性和可维护性。

- **Actions**：简化了表单处理和状态管理，支持异步函数处理挂起状态、错误和乐观更新。([react.dev][3])

- **新的钩子函数**：

  - `useActionState`：用于管理异步操作的状态。([react.dev][3])

  - `useFormStatus`：用于获取表单的提交状态。

  - `useOptimistic`：用于实现乐观 UI 更新。

- **新 API：`use`**：允许在渲染期间读取资源值，如 Promise 或上下文，简化了异步数据获取。([kellton.com][2])

- **React Compiler**：引入了新的编译器，自动优化代码，减少对 `memo`、`useCallback` 等手动优化的依赖。

- **增强的资源加载**：支持异步脚本、样式表和资源的预加载，提升了页面加载性能。

- **改进的错误处理和调试**：提供了更清晰的错误信息，特别是在服务端和客户端渲染不一致时，便于开发者调试。

这些更新使得 React 19 在性能、开发体验和可维护性方面都有了显著提升。

---

## 📌 总结对比

| 特性                                 | React 18      | React 19                                                 |                                                                                             |
| ------------------------------------ | ------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 并发渲染                             | ✅ 引入       | ✅ 进一步优化                                            |                                                                                             |
| 自动批处理                           | ✅ 支持       | ✅ 支持                                                  |                                                                                             |
| startTransition API                  | ✅ 新增       | ✅ 支持                                                  |                                                                                             |
| Server Components                    | ❌ 不支持     | ✅ 新增                                                  |                                                                                             |
| `'use client'` / `'use server'` 指令 | ❌ 不支持     | ✅ 新增                                                  |                                                                                             |
| Actions                              | ❌ 不支持     | ✅ 新增                                                  |                                                                                             |
| 新钩子函数                           | ✅ `useId` 等 | ✅ `useActionState`、`useFormStatus`、`useOptimistic` 等 |                                                                                             |
| `use` API                            | ❌ 不支持     | ✅ 新增                                                  |                                                                                             |
| React Compiler                       | ❌ 不支持     | ✅ 新增                                                  |                                                                                             |
| 资源加载优化                         | ❌ 不支持     | ✅ 新增                                                  |                                                                                             |
| 错误处理和调试                       | ✅ 基础支持   | ✅ 增强支持                                              | ([Webkul Software][1], [react.dev][4], [维基百科][5], [GeeksforGeeks][6], [kellton.com][2]) |

---

如果您需要进一步了解如何在项目中升级到 React 19，或是如何利用这些新特性优化您的应用，欢迎继续提问，我将为您提供详细的指导。

[1]: https://webkul.com/blog/whats-new-in-react-18/?utm_source=chatgpt.com "What's new in React 18? - Webkul"
[2]: https://www.kellton.com/kellton-tech-blog/react-19-latest-features-and-updates?utm_source=chatgpt.com "Everything on React 19 New Features and Updates"
[3]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
[4]: https://react.dev/blog/2022/03/29/react-v18?utm_source=chatgpt.com "React v18.0"
[5]: https://en.wikipedia.org/wiki/React_%28software%29?utm_source=chatgpt.com "React (software)"
[6]: https://www.geeksforgeeks.org/react-19-new-features-and-updates/?utm_source=chatgpt.com "React 19 : New Features and Updates - GeeksforGeeks"
