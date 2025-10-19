# React Fiber

非常好的问题 👍
**React Fiber 架构** 是 React 从 v16 开始引入的底层重构核心。理解 Fiber 架构是理解 React 性能优化、并发渲染（Concurrent Rendering）和 Hooks 原理的关键。

下面我会从 **历史背景 → 问题 → Fiber 设计 → 工作流程 → 优势** 五个部分讲清楚。

---

## 🧩 一、背景：为什么要有 Fiber

在 React v15 及之前，React 使用的是一种叫 **Stack Reconciler** 的架构。
即：**递归、同步、不可中断** 的渲染机制。

当组件更新时，React 会从根节点开始递归计算虚拟 DOM 树的差异（diff），然后一次性更新整棵树。

### 🔴 问题：

- **更新不可中断**：组件树大时，主线程长时间被占用（浏览器不能响应用户交互、动画卡顿）。
- **没有优先级调度**：重要的任务（比如用户输入）和低优先级任务（比如渲染列表）一起被阻塞。
- **难以实现并发渲染**：React 无法暂停、恢复或中断渲染过程。

🧠 所以 React 团队决定——**重写底层算法**，从同步递归变成异步可中断的调度系统。
这就是 **Fiber Reconciler**。

---

## ⚙️ 二、什么是 Fiber

> 简单来说：**Fiber 是 React 中对每个虚拟 DOM 节点的可中断工作单元。**

### 🧩 Fiber 是一个“数据结构”

每个组件对应一个 Fiber 节点（Fiber Node），包含：

```ts
type Fiber = {
  type: any; // 对应组件类型（Function/Class/HostComponent）
  stateNode: any; // 对应的真实 DOM 或组件实例
  child: Fiber | null; // 第一个子节点
  sibling: Fiber | null; // 下一个兄弟节点
  return: Fiber | null; // 父节点
  pendingProps: any; // 新的 props
  memoizedProps: any; // 上一次的 props
  memoizedState: any; // 上一次的 state
  flags: Flags; // 需要执行的副作用类型（如 Update、Placement）
  alternate: Fiber | null; // 旧 Fiber（用于 diff）
};
```

📦 可以理解为：

- React 以前是「递归调用函数」来遍历组件树
- React Fiber 是「显式链表结构」来遍历（可以暂停和恢复）

---

## 🕹 三、Fiber 的核心设计目标

| 目标             | 描述                                          |
| ---------------- | --------------------------------------------- |
| 🧮 可中断        | 渲染过程可以分成小任务执行，必要时暂停        |
| 🔁 可恢复        | 暂停的任务可在未来继续执行                    |
| 🧵 可重用        | 每个 Fiber 可对应前后两次渲染，用于 diff 对比 |
| ⚡️ 可分配优先级 | 不同任务可有不同优先级（输入 > 动画 > 渲染）  |
| 👀 可追踪副作用  | 记录哪些节点需要更新、插入或删除              |

---

## 🧠 四、Fiber 的双缓存机制（Double Buffering）

React 内部维护两棵 Fiber 树：

| 树     | 名称             | 用途                      |
| ------ | ---------------- | ------------------------- |
| 当前树 | `current`        | 当前正在屏幕上显示的 UI   |
| 工作树 | `workInProgress` | React 正在构建的下一帧 UI |

更新过程：
1️⃣ 复制一份当前树 → 作为 `workInProgress` 树
2️⃣ 在 `workInProgress` 树上执行计算（diff、更新 state）
3️⃣ 计算完成后，一次性将 `workInProgress` 替换成 `current`
→ 确保渲染是原子性的，不会出现中间状态。

---

## 🔄 五、Fiber 的执行阶段（两个阶段）

### 1️⃣ Render 阶段（可中断）

- 负责构建 `workInProgress` 树。
- 计算每个 Fiber 的更新（diff）。
- 可被中断、恢复或重新开始。
- 执行函数组件的 render()。

> 调度器（Scheduler）会根据优先级和空闲时间（`requestIdleCallback`）分片执行。

```text
function App() {
  return <div>Hello</div>;
}
```

→ React 会在后台分片计算每个 Fiber 节点的变化。

---

### 2️⃣ Commit 阶段（不可中断）

- 一旦确定要提交更新，就进入 commit 阶段。
- 执行真实 DOM 操作（插入、删除、更新属性）。
- 执行副作用（如 `useEffect`、`componentDidMount`）。

> 这一阶段是同步的，保证 UI 一致性。

---

## ⚖️ 六、React Fiber 的工作流程（简化示意）

```text
触发更新
  ↓
构建 workInProgress 树（Render 阶段，可中断）
  ↓
收集所有副作用（需要更新的节点）
  ↓
提交更新到 DOM（Commit 阶段，不可中断）
  ↓
current 树 ← workInProgress 树
```

React Fiber 使用“循环+链表”遍历，而不是递归：

```js
while (nextUnitOfWork !== null) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
}
```

每个 `performUnitOfWork` 执行单个 Fiber 节点的工作（渲染、diff、调度子节点）。

---

## ⚡️ 七、Fiber 架构的优势

| 优势                | 说明                                       |
| ------------------- | ------------------------------------------ |
| ✅ 可中断           | 渲染过程可拆分为小任务                     |
| ✅ 可分优先级       | 用户输入比动画更新更优先                   |
| ✅ 支持并发渲染     | React 18 的 Concurrent Mode 正是基于 Fiber |
| ✅ 提升性能         | 避免长时间主线程阻塞                       |
| ✅ 灵活的副作用管理 | 每个 Fiber 节点可独立标记更新类型          |

---

## 🌊 八、Fiber 与 React 18 并发特性（Concurrent Rendering）

React 18 开启了“并发特性”，比如：

- `useTransition`
- `startTransition`
- `Suspense`
- `useDeferredValue`

这些都基于 Fiber 架构提供的 **可中断 & 可恢复渲染** 实现。
也就是说：

> 没有 Fiber，就没有 Concurrent Mode。

---

## 🧭 九、总结对比

| 对比项   | Stack Reconciler（旧） | Fiber Reconciler（新）                  |
| -------- | ---------------------- | --------------------------------------- |
| 执行方式 | 递归调用栈             | 循环链表                                |
| 可中断性 | 否                     | 是                                      |
| 可恢复性 | 否                     | 是                                      |
| 优先级   | 无                     | 有                                      |
| 渲染模式 | 同步                   | 可异步                                  |
| 并发能力 | 无                     | 有                                      |
| 支撑特性 | React 15               | React 16+ (Hooks, Concurrent, Suspense) |

---

## 💬 一句话总结

> **React Fiber 是一次彻底的调度系统重构，**
> 将原本同步、不可中断的渲染过程改造成异步、可调度、可恢复的任务系统。
> 它是 React 从“UI 框架”进化为“可调度渲染引擎”的关键。

---

如果你想更直观理解，我可以帮你画一张
📊「Fiber 架构下的渲染流程图」，展示“Render → Commit → 替换 Fiber 树”的完整过程，要我画给你看看吗？

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

# React Router

React Router 的原理可以理解为：**在单页应用（SPA）中通过监听 URL 的变化（hash 或 history），来决定渲染哪个组件**。
它并不真的去“跳转页面”，而是**拦截浏览器的默认行为**，通过 **前端路由机制** 动态切换视图。

下面我们从核心机制到实现原理，逐步讲清楚 👇

---

## 🧩 一、前端路由的两种模式

React Router 支持两种基础路由模式：

### 1️⃣ Hash 模式 (`HashRouter`)

- URL 带有 `#`，如：

  ```
  https://example.com/#/home
  ```

- 通过监听 `hashchange` 事件来判断路径变化。
- 特点：

  - 不会向服务器发送请求；
  - 兼容性好；
  - 不太美观。

**监听方式：**

```js
window.addEventListener("hashchange", () => {
  console.log(location.hash); // #/home
});
```

---

### 2️⃣ History 模式 (`BrowserRouter`)

- 利用 HTML5 的 `history.pushState()` 与 `popstate` 事件；
- URL 比较干净：

  ```
  https://example.com/home
  ```

- 特点：

  - 更接近真实页面跳转；
  - 需要后端配合，所有路径都重定向到 index.html；
  - 更现代的实现方式。

**监听方式：**

```js
window.addEventListener("popstate", () => {
  console.log(location.pathname); // /home
});
```

---

## ⚙️ 二、React Router 的核心思想

React Router 主要做了三件事：

1. **拦截导航行为**（不让浏览器刷新）

   - 使用 `pushState()` 或改变 `hash`；
   - 阻止 `<a>` 标签默认跳转；
   - 内部改为状态更新。

2. **监听 URL 变化**

   - `popstate`（history 模式）；
   - `hashchange`（hash 模式）；
   - 然后触发重新渲染。

3. **匹配路由规则 → 渲染对应组件**

   - 根据当前路径匹配到 Route；
   - 渲染对应组件；
   - 利用 React 的状态更新机制进行视图切换。

---

## 🧠 三、核心组件的作用

| 组件                               | 功能                                      |
| ---------------------------------- | ----------------------------------------- |
| `<BrowserRouter>` / `<HashRouter>` | 提供路由上下文（RouterContext）           |
| `<Routes>`                         | 管理一组 `<Route>`，匹配当前路径          |
| `<Route>`                          | 定义路径与组件的映射关系                  |
| `<Link>`                           | 实现前端无刷新跳转（封装 pushState/hash） |
| `useNavigate()`                    | 以命令式方式控制路由跳转                  |
| `useParams()` / `useLocation()`    | 读取当前路径信息                          |

---

## 🧩 四、简易实现示例

下面是一个极简的 React Router 实现思路（hash 模式）：

```jsx
import React, { useState, useEffect } from "react";

function Router({ routes }) {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");

  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.slice(1));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const match = routes.find((r) => r.path === path);
  return match ? match.component : <div>404</div>;
}

// 使用：
const routes = [
  { path: "/", component: <Home /> },
  { path: "/about", component: <About /> },
];

export default function App() {
  return (
    <>
      <a href="#/">Home</a>
      <a href="#/about">About</a>
      <Router routes={routes} />
    </>
  );
}
```

---

## 🧭 五、React Router 的高级特性（v6+）

- **动态路由匹配**：支持 `:id` 参数；
- **懒加载**：配合 `React.lazy()`；
- **嵌套路由**：通过 `<Outlet />`；
- **数据加载与提交 API**（v6.4+ 新特性）；
- **useNavigate / useLoaderData** 等 hooks 化接口。

---

✅ **总结一句话：**

> React Router 的核心是通过监听 URL（hash 或 history）变化，更新内部状态，从而触发 React 组件重新渲染，实现无刷新的“页面切换”。

---

是否希望我再帮你画一张图（比如 BrowserRouter 内部事件流动图）来直观说明原理？

# 函数式编程

非常好 👍 —— “**函数式编程（Functional Programming, FP）**” 是现代前端和 JavaScript 编程思想中非常核心的一部分。
这是一种**思想层面的编程范式**，与“命令式编程”“面向对象编程”并列。

下面我会带你从概念、特性、代码示例到在 JavaScript 实战中的应用一步讲透 👇

---

## 🧩 一、什么是函数式编程

> **函数式编程（FP）** 是一种将“计算”视为“函数之间的组合和变换”的编程范式。
> 程序的核心是：**纯函数 + 不可变数据 + 函数组合**。

换句话说：

> 在 FP 中，你不去“命令计算机做什么（how）”，而是“声明要得到什么（what）”。

---

## ⚖️ 二、命令式 vs 函数式

| 思想     | 命令式编程      | 函数式编程             |
| -------- | --------------- | ---------------------- |
| 核心     | 命令、步骤      | 数据映射、组合         |
| 重点     | 怎么做（How）   | 想要什么（What）       |
| 状态     | 可变            | 不可变                 |
| 副作用   | 常有            | 尽量避免               |
| 示例语言 | C, Java, Python | Haskell, Elm, JS(部分) |

---

### 🔍 对比示例

**命令式写法：**

```js
const numbers = [1, 2, 3, 4, 5];
const result = [];
for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] % 2 === 0) {
    result.push(numbers[i] * 2);
  }
}
console.log(result); // [4, 8]
```

**函数式写法：**

```js
const result = [1, 2, 3, 4, 5].filter((n) => n % 2 === 0).map((n) => n * 2);

console.log(result); // [4, 8]
```

➡️ 思维上是从“命令计算机循环和判断”
➡️ 转变为“声明我要筛选偶数并乘以 2”。

---

## 🧠 三、函数式编程的核心特征

### 1️⃣ 纯函数（Pure Function）

> **相同输入 → 永远相同输出；无副作用。**

```js
// ✅ 纯函数
function add(a, b) {
  return a + b;
}

// ❌ 非纯函数（有副作用）
let count = 0;
function addCount(a) {
  count += a;
  return count;
}
```

---

### 2️⃣ 不可变性（Immutability）

> 不直接修改原数据，而是返回新数据。

```js
// ❌ 会修改原数组
arr.push(4);

// ✅ 返回新数组
const newArr = arr.concat(4);
```

在现代 JS 中，可以用 `...` 展开语法：

```js
const newState = { ...state, name: "Alice" };
```

---

### 3️⃣ 函数组合（Function Composition）

> 把多个小函数组合成一个更复杂的函数。

```js
const add1 = (x) => x + 1;
const double = (x) => x * 2;

const compose = (f, g) => (x) => f(g(x));

const add1ThenDouble = compose(double, add1);

console.log(add1ThenDouble(2)); // (2 + 1) * 2 = 6
```

现代库（如 **lodash/fp**, **Ramda**）提供 `compose` / `pipe` 工具：

```js
import { pipe } from "ramda";

const process = pipe(
  (x) => x + 1,
  (x) => x * 2,
  (x) => x.toString()
);
```

---

### 4️⃣ 高阶函数（Higher-order Function）

> **函数可以作为参数或返回值。**

```js
function withLogging(fn) {
  return function (...args) {
    console.log("Calling with", args);
    const result = fn(...args);
    console.log("Result:", result);
    return result;
  };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3);
```

---

### 5️⃣ 柯里化（Currying）

> 把接受多个参数的函数转换为接受单一参数的函数链。

```js
// 普通函数
const add = (a, b) => a + b;

// 柯里化版本
const curryAdd = (a) => (b) => a + b;

console.log(curryAdd(1)(2)); // 3
```

应用场景：复用部分参数（偏应用函数）

```js
const add5 = curryAdd(5);
console.log(add5(10)); // 15
```

---

## 🔁 四、函数式编程常用技巧

| 技巧               | 示例                   | 描述         |
| ------------------ | ---------------------- | ------------ |
| **map**            | `arr.map(fn)`          | 映射每个元素 |
| **filter**         | `arr.filter(fn)`       | 过滤数组     |
| **reduce**         | `arr.reduce(fn, init)` | 累加器操作   |
| **compose / pipe** | `pipe(fn1, fn2)`       | 函数组合     |
| **curry**          | `curry(fn)`            | 参数复用     |
| **partial**        | `partial(fn, a)`       | 偏函数应用   |
| **memoize**        | 缓存函数结果           | 提升性能     |

---

## 🧮 五、实战示例：数据处理管道

```js
import { pipe } from "ramda";

const data = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 25 },
];

const process = pipe(
  (arr) => arr.filter((p) => p.age >= 18),
  (arr) => arr.map((p) => p.name),
  (names) => names.join(", ")
);

console.log(process(data)); // "Alice, Charlie"
```

> 🎯 这就是典型的函数式思维：数据 → 通过纯函数流水线 → 输出结果。

---

## 🧱 六、函数式与面向对象（OOP）对比

| 维度     | 面向对象（OOP）   | 函数式（FP）     |
| -------- | ----------------- | ---------------- |
| 组织方式 | 对象（数据+行为） | 函数             |
| 状态管理 | 可变状态          | 不可变数据       |
| 代码复用 | 继承、多态        | 组合、高阶函数   |
| 侧重点   | 封装、抽象        | 组合、变换       |
| 示例语言 | Java, C++         | Haskell, JS, Elm |

---

## 🧠 七、在 JavaScript 中的常见函数式工具库

| 库            | 特点                         |
| ------------- | ---------------------------- |
| **Lodash/fp** | 提供函数式风格的 Lodash 版本 |
| **Ramda**     | 专注于函数组合和不可变数据   |
| **RxJS**      | 响应式编程（流式 FP）        |
| **Immer**     | 函数式不可变数据处理         |
| **Redux**     | 以纯函数 reducer 为核心思想  |

---

## ⚙️ 八、在前端架构中的应用

| 应用场景          | 函数式思想体现                           |
| ----------------- | ---------------------------------------- |
| **React Hooks**   | `useState` 返回不可变状态与纯更新函数    |
| **Redux Reducer** | `(state, action) => newState` 纯函数     |
| **RxJS 流**       | `pipe(map, filter, reduce)` 流式函数组合 |
| **数据处理管道**  | 对 JSON 或接口数据进行纯变换             |

---

## 🧩 九、总结要点

| 核心思想   | 一句话理解                    |
| ---------- | ----------------------------- |
| 纯函数     | 相同输入 → 相同输出，无副作用 |
| 不可变性   | 不修改原数据，返回新数据      |
| 函数组合   | 小函数拼装出复杂逻辑          |
| 高阶函数   | 函数操作函数                  |
| 声明式编程 | 描述“做什么”，而非“怎么做”    |

---

## ✅ 十、一句话总结

> **函数式编程的本质：用纯函数描述数据变换的过程，用组合代替命令。**

它让代码更可预测、更易测试、更易复用，也让复杂逻辑变得像“数学函数”一样清晰。

---

是否希望我帮你举几个 **前端实际场景中用函数式思想优化代码** 的例子？
比如：

- 用函数式方式优化 `Array` 处理；
- 优化 `Redux reducer`；
- 或者把命令式逻辑改写成函数式管道。
