# Zustand

Zustand 是一个轻量级的 React 状态管理库，其底层实现基于发布-订阅模式，并利用 React 的 `useSyncExternalStoreWithSelector` API 实现高效的状态更新和组件渲染。与 Redux 相比，Zustand 提供了更简洁的 API 和更灵活的使用方式。([掘金][1], [支付宝开放平台][2])

---

## 🧠 Zustand 的底层原理

### 1. 发布-订阅机制

Zustand 的核心是一个简单的发布-订阅系统：

- **状态存储**：使用闭包维护内部状态。
- **订阅管理**：通过 `Set` 存储订阅者函数。
- **状态更新**：调用 `setState` 更新状态，并通知所有订阅者。([牛客网][3], [GitHub][4])

简化的实现如下：

```javascript
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;
  const setState = (partial) => {
    state = typeof partial === "function" ? partial(state) : partial;
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}
```

这种机制确保了状态的集中管理和组件的高效更新。

### 2. 与 React 的集成

Zustand 使用 `useSyncExternalStoreWithSelector` API 将其 store 与 React 组件连接，确保组件在状态变化时能够精确地重新渲染。([掘金][5])

这种方式避免了不必要的渲染，提高了性能。

### 3. 中间件支持

Zustand 提供了中间件机制，允许开发者在状态更新过程中插入自定义逻辑，如日志记录、持久化等。([掘金][6])

中间件的实现方式类似于函数组合，增强了状态管理的灵活性。

---

## 🔍 Zustand 与 Redux 的区别

| 特性       | Zustand                                         | Redux                                             |                          |
| ---------- | ----------------------------------------------- | ------------------------------------------------- | ------------------------ |
| 状态存储   | 通过 Hook 创建多个独立的 store，无需 Provider。 | 使用单一的全局 store，需要通过 Provider 注入。    |                          |
| 状态更新   | 直接调用 `set` 方法更新状态，支持函数式更新。   | 通过 dispatch action，使用 reducer 处理状态更新。 |                          |
| 异步处理   | 在 store 创建函数中直接处理异步逻辑。           | 需要使用中间件（如 redux-thunk）处理异步操作。    |                          |
| 中间件支持 | 支持自定义中间件，增强 `set` 方法功能。         | 通过 `applyMiddleware` 添加中间件。               |                          |
| 学习曲线   | API 简洁，易于上手。                            | 概念较多，学习曲线较陡。                          |                          |
| 体积       | 小巧，约 1KB。                                  | 相对较大。                                        | ([腾讯云][7], [掘金][6]) |

---

## ✅ 总结

Zustand 提供了一个简单、高效的状态管理方案，适合需要快速开发和灵活状态管理的项目。相比之下，Redux 提供了更严格的结构和更强的可预测性，适合大型应用和团队协作。选择哪一个取决于项目的具体需求和团队的偏好。

如果您对 Zustand 的使用或与其他状态管理库的比较有更多疑问，欢迎继续提问！

[1]: https://juejin.cn/post/7274163003157790720?utm_source=chatgpt.com "一文弄懂Zustand源码实现 - 稀土掘金"
[2]: https://open.alipay.com/portal/forum/post/134901097?utm_source=chatgpt.com "Zustand 和Redux 的区别-支付宝开发者社区"
[3]: https://www.nowcoder.com/discuss/519023099535273984?utm_source=chatgpt.com "Zustand-天生为了React设计的状态管理工具+源码分 - 牛客网"
[4]: https://github.com/wx-chevalier/React-Notes/blob/master/03~%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86/Zustand/99~%E5%8F%82%E8%80%83%E8%B5%84%E6%96%99/2022-%E7%B2%BE%E8%AF%BB%20zustand%20%E6%BA%90%E7%A0%81.md?utm_source=chatgpt.com "2022-精读zustand 源码.md - GitHub"
[5]: https://juejin.cn/post/7324867096604540962?utm_source=chatgpt.com "Zustand 源码解析：第一章external store - 稀土掘金"
[6]: https://juejin.cn/post/7495574058698801193?utm_source=chatgpt.com "react全局状态管理——redux和zustand，及其区别 - 稀土掘金"
[7]: https://cloud.tencent.com/developer/article/1956768?utm_source=chatgpt.com "精读《zustand 源码》-腾讯云开发者社区"

# useSyncExternalStoreWithSelector

`useSyncExternalStoreWithSelector` 是 React 18 引入的一个高级 Hook，旨在帮助组件安全、高效地订阅外部状态存储（如 Redux、Zustand 等），并在状态变化时触发组件更新。它在 `useSyncExternalStore` 的基础上增加了选择器（selector）和比较函数（isEqual），使得组件只在所选状态片段发生变化时才重新渲染，从而提升性能。([青雲的博客][1])

---

## 📌 基本用法

`useSyncExternalStoreWithSelector` 的函数签名如下：

```javascript
const selectedState = useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual
);
```

- **subscribe**：一个函数，用于订阅外部 store 的变化，接收一个回调函数，并返回取消订阅的函数。
- **getSnapshot**：一个函数，返回当前的 store 快照。
- **getServerSnapshot**（可选）：一个函数，在服务端渲染时使用，返回初始的 store 快照。
- **selector**：一个函数，从 store 快照中选择组件所需的部分状态。
- **isEqual**（可选）：一个函数，用于比较 selector 返回的值是否发生变化，默认使用 `Object.is`。([zh-hans.react.dev][2])

---

## 🧠 工作原理

`useSyncExternalStoreWithSelector` 的核心机制包括：

1. **订阅外部 store**：通过 `subscribe` 函数监听 store 的变化。
2. **获取快照**：当 store 变化时，调用 `getSnapshot` 获取最新的状态快照。
3. **状态选择**：使用 `selector` 从快照中提取组件所需的状态片段。
4. **比较变化**：使用 `isEqual` 比较新旧状态片段，决定是否触发组件重新渲染。([zh-hans.react.dev][2], [DEVLOG of andyyou][3])

这种机制确保了组件只在真正需要更新时才重新渲染，避免了不必要的性能开销。

---

## 🧪 示例代码

以下是一个使用 `useSyncExternalStoreWithSelector` 的示例，展示了如何订阅外部 store 并选择特定的状态片段：

```javascript
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";

function useCustomStore(selector) {
  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
    selector,
    Object.is // 可选的比较函数
  );
}
```

在组件中使用：

```javascript
function MyComponent() {
  const selectedData = useCustomStore((state) => state.selectedField);
  return <div>{selectedData}</div>;
}
```

在上述示例中，组件只会在 `selectedField` 发生变化时重新渲染。([CSDN 博客][4])

---

## 🚀 应用场景

- **状态管理库集成**：如 Redux、Zustand 等，使用 `useSyncExternalStoreWithSelector` 实现高效的状态订阅和组件更新。
- **性能优化**：通过选择器和比较函数，避免组件因无关状态变化而重新渲染。
- **服务端渲染支持**：提供 `getServerSnapshot`，确保在服务端渲染时获取正确的初始状态。([zh-hans.react.dev][2])

---

总之，`useSyncExternalStoreWithSelector` 提供了一种高效、安全的方式，使 React 组件能够精确地订阅外部状态存储，并在所需状态变化时进行更新。它在现代 React 应用中，尤其是在使用外部状态管理库时，起到了关键作用。

[1]: https://www.echovic.com/blog/source-code/analyzing-useSyncExternalStore-source-code?utm_source=chatgpt.com "深入解析useSyncExternalStore 在React 的实现和运行机制| 青雲的博客"
[2]: https://zh-hans.react.dev/reference/react/useSyncExternalStore?utm_source=chatgpt.com "useSyncExternalStore – React 中文文档"
[3]: https://andyyou.github.io/2022/01/05/use-sync-external-store-with-solving-problem/?utm_source=chatgpt.com "React 18 - 了解useSyncExternalStore - DEVLOG of andyyou"
[4]: https://blog.csdn.net/weixin_43294560/article/details/123878484?utm_source=chatgpt.com "ReactHook useSyncExternalStore、useInsertionEffect - CSDN博客"
