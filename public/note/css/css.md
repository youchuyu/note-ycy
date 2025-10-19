# 选择器

# 样式

# 响应式

在 H5（HTML5）开发中，实现响应式以适配不同设备（如手机、平板、PC）是前端开发的重要任务。以下是常见的几种实现响应式设计的方式：

---

## ✅ 一、使用媒体查询（Media Queries）

**原理**：根据设备的屏幕宽度、分辨率等条件应用不同的 CSS 样式。

```css
/* 手机 */
@media screen and (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}

/* 平板 */
@media screen and (min-width: 601px) and (max-width: 1024px) {
  body {
    background-color: lightgreen;
  }
}

/* 桌面 */
@media screen and (min-width: 1025px) {
  body {
    background-color: lightpink;
  }
}
```

📌**优点**：简单直观，适合大多数场景。
📌**缺点**：维护多个断点可能变复杂。

---

## ✅ 二、弹性布局（Flexbox）和网格布局（Grid）

### 🔹Flexbox 示例：

```css
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
```

### 🔹Grid 示例：

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

📌**优点**：灵活布局，适应各种屏幕宽度。
📌**缺点**：老旧浏览器兼容性较差（Grid 特别注意）。

---

## ✅ 三、百分比布局 / vw-vh 单位

### 使用百分比或视口单位控制宽高：

```css
.container {
  width: 80%; /* 相对父级 */
  height: 100vh; /* 视口高度 */
  padding: 5vw; /* 视口宽度 */
}
```

📌**优点**：自然响应，计算简单。
📌**缺点**：在极小或极大的屏幕上可能表现不一致。

---

## ✅ 四、rem / em 响应式单位 + `html` 动态设置字体大小

结合 JS 控制根元素字体大小实现响应式布局（移动端常用）：

```js
// rem 适配方案（基于 750px 设计稿）
(function () {
  const docEl = document.documentElement;
  function setRemUnit() {
    const width = docEl.clientWidth;
    docEl.style.fontSize = (width / 750) * 100 + "px";
  }
  setRemUnit();
  window.addEventListener("resize", setRemUnit);
})();
```

```css
.container {
  width: 3.75rem; /* 375px 等比 */
}
```

📌**优点**：配合设计稿尺寸还原度高，适合移动端开发。
📌**缺点**：对 JS 依赖强，维护成本稍高。

---

## ✅ 五、viewport 设置（配合移动端适配）

在 HTML `<head>` 中添加：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

📌**作用**：确保移动设备按照设备宽度显示页面，不缩放或放大。

---

## ✅ 六、响应式框架（如 Bootstrap, Tailwind）

### 使用 Bootstrap 的响应式类名：

```html
<div class="col-sm-6 col-md-4 col-lg-3"></div>
```

📌**优点**：开发快，组件丰富。
📌**缺点**：侵入性强，灵活性有限。

---

## ✅ 七、媒体查询结合 CSS 变量（进阶）

现代写法，使用 CSS 自定义属性与媒体查询结合：

```css
:root {
  --spacing: 16px;
}

@media (max-width: 600px) {
  :root {
    --spacing: 8px;
  }
}

.box {
  padding: var(--spacing);
}
```

📌**优点**：集中管理样式变量，易于维护和调整。

---

## 🔚 总结

| 方法           | 特点                 | 使用场景        |
| -------------- | -------------------- | --------------- |
| 媒体查询       | 精准控制不同断点样式 | PC + 移动适配   |
| Flex/Grid      | 弹性自适应布局       | 通用布局        |
| 百分比 / vw/vh | 相对单位适配         | 自适应尺寸      |
| rem + JS       | 设计稿还原度高       | 移动端项目      |
| Viewport 标签  | 设置基础适配规则     | 所有移动页面    |
| 响应式框架     | 快速开发             | 原型 / 管理后台 |

---

如果你有特定的设备支持要求（如 iPhoneX、折叠屏）、设计稿尺寸、还是考虑 WebApp / 小程序，也可以告诉我，我可以给出更定制化的方案。

# BFC

BFC（Block Formatting Context，块级格式化上下文）是 CSS 中的一个非常重要且常被忽视的概念，它直接关系到元素的布局行为，尤其是在解决**外边距合并、清除浮动、避免重叠等问题**时非常有用。

---

## 🔹 什么是 BFC？

> **BFC 是一块独立的渲染区域，容器内部的布局不会影响到外部，也不会被外部影响。**

可以理解为：BFC 就像“一个自成一体的盒子”，它的布局规则不受周围元素干扰。

---

## 🔹 BFC 的触发条件（创建 BFC 的方式）

以下这些元素会自动或通过 CSS 创建 BFC：

| 方式                              | 示例代码                 |
| --------------------------------- | ------------------------ |
| 根元素（如 `<html>`）             | 默认就是 BFC             |
| `float` 不为 `none`               | `float: left/right;`     |
| `position` 为 `absolute`/`fixed`  | `position: absolute;`    |
| `display: flow-root`              | ✅ 推荐新方式            |
| `overflow` 不为 `visible`         | `overflow: hidden/auto;` |
| `display: inline-block`           | `display: inline-block;` |
| `table-cell`, `flex`, `grid` 元素 | `display: flex;`         |

---

## 🔹 BFC 的特性和作用

### 1. **解决外边距合并（margin collapse）**

**问题：**
两个垂直块元素之间 margin 会合并。

```html
<div class="box1">...</div>
<div class="box2">...</div>
```

```css
.box1 {
  margin-bottom: 20px;
}
.box2 {
  margin-top: 30px;
}
```

实际间距是 **30px**，而不是 20+30=50。

✅ **用 BFC 包裹其中一个就不会合并**：

```css
.box2-wrapper {
  overflow: hidden; /* 创建 BFC */
}
```

---

### 2. **清除浮动（清除父元素高度塌陷）**

```html
<div class="container">
  <div class="float-child"></div>
</div>
```

如果 `.float-child { float: left; }`，父元素 `.container` 没有高度。

✅ 用 BFC 自动包住浮动：

```css
.container {
  overflow: hidden;
}
```

或现代写法：

```css
.container {
  display: flow-root;
}
```

---

### 3. **防止元素被浮动元素覆盖**

```html
<div class="float-box">浮动内容</div>
<div class="text">被遮住的文字</div>
```

✅ 给 `.text` 添加 BFC，可防止被浮动遮挡：

```css
.text {
  overflow: auto;
}
```

---

### 4. **布局隔离、避免 margin 外扩等问题**

BFC 内部的元素不会影响外部布局，非常适合在模块化组件开发中使用，起到“沙盒”作用。

---

## 🔹 实战推荐：使用 `display: flow-root`

```css
.wrapper {
  display: flow-root; /* 最简洁的创建 BFC 的方式 */
}
```

兼容性良好（现代浏览器都支持），语义明确。

---

## ✅ 总结一句话：

> BFC 是 CSS 中用来**隔离布局影响**的机制，可以用来解决：
>
> - 外边距合并
> - 浮动清除
> - 防止布局被浮动影响
> - 隔离内部/外部布局

---

如果你遇到具体的外边距塌陷或浮动问题，我可以帮你用 BFC 方式解决并给出 demo 示例。

# 合成层

在现代浏览器中，合成层（Composite Layer）通过将页面元素分层处理，利用 GPU 加速渲染，从而提升动画和交互性能。然而，过多的合成层会导致内存占用增加、管理复杂度上升，甚至可能引发性能下降。因此，合理控制合成层的数量对于优化页面性能至关重要。

---

## 🎯 控制合成层数量的策略

### 1. **谨慎使用 `will-change` 和 `translateZ(0)`**

虽然 `will-change` 和 `translateZ(0)` 可以提示浏览器提前优化特定属性的变化，从而提升性能，但滥用这些属性会导致不必要的合成层创建。每个合成层都需要占用 GPU 内存和管理资源，过多的合成层可能适得其反。([GitHub][1])

**建议：**

- 仅在确实需要提升性能的元素上使用 `will-change`，并在动画结束后移除该属性。
- 避免在大量元素上同时使用 `translateZ(0)`，尤其是在移动设备上。

### 2. **优先使用合成友好的 CSS 属性**

在实现动画时，优先使用不会触发重排（Reflow）和重绘（Repaint）的 CSS 属性，如 `transform` 和 `opacity`。这些属性的变化通常只涉及合成阶段，性能开销较小。

**示例：**

```css
/* 推荐 */
.element {
  transition: transform 0.3s ease;
}

/* 避免 */
.element {
  transition: left 0.3s ease;
}
```

使用 `transform` 替代 `left`、`top` 等属性，可以避免触发布局计算和重绘，从而提升性能。([CSDN 博客][2])

### 3. **避免复杂的视觉效果**

某些 CSS 属性，如 `filter`、`box-shadow` 和 `mix-blend-mode`，可能会导致浏览器为元素创建新的合成层。在设计时，应避免在大量元素上同时使用这些属性，尤其是在性能敏感的场景中。([CSDN 博客][2])

**建议：**

- 仅在必要时使用复杂的视觉效果。
- 对于静态内容，尽量避免使用会触发合成层的属性。

### 4. **利用浏览器的层压缩机制**

现代浏览器具备自动合并相邻合成层的能力，以减少资源消耗。开发者可以通过保持相邻元素的属性一致性，帮助浏览器更有效地合并合成层。([CSDN 博客][3])

**建议：**

- 避免在相邻元素上使用不同的混合模式或滤镜效果。
- 保持相邻元素的层级关系和样式一致，以促进合成层的合并。

### 5. **使用 `contain` 属性限制影响范围**

CSS 的 `contain` 属性可以限制元素的影响范围，防止其变化影响到其他部分，从而减少不必要的重排和重绘。([腾讯云][4])

**示例：**

```css
.container {
  contain: layout paint;
}
```

通过设置 `contain`，可以将元素的布局和绘制限制在自身范围内，减少对其他元素的影响。([腾讯云][4])

---

## 🧪 调试与监控工具

为了有效控制合成层的数量和优化页面性能，开发者可以利用以下工具进行调试和监控：

- **Chrome DevTools → Layers 面板**：可视化页面的合成层结构，帮助识别不必要的合成层。
- **Chrome DevTools → Rendering → Layer Borders**：显示页面中各个合成层的边界，便于分析层的分布。
- **Performance 面板**：分析页面的渲染性能，识别可能的性能瓶颈。

---

## ✅ 总结

合理控制合成层的数量对于提升页面性能至关重要。通过谨慎使用会触发合成层的属性、优先使用合成友好的 CSS 属性、避免复杂的视觉效果、利用浏览器的层压缩机制以及使用 `contain` 属性限制影响范围，开发者可以有效地管理合成层，优化页面的渲染性能。

此外，借助浏览器提供的调试和监控工具，开发者可以实时分析和优化页面的合成层结构，确保应用在各种设备上都能提供流畅的用户体验。

[1]: https://github.com/hello2dj/blog/issues/26?utm_source=chatgpt.com "web优化之compositing layers · Issue #26 · hello2dj/blog - GitHub"
[2]: https://blog.csdn.net/weixin_46247794/article/details/146437779?utm_source=chatgpt.com "合成层优化 - CSDN博客"
[3]: https://blog.csdn.net/qq_60743005/article/details/146336308?utm_source=chatgpt.com "【2】前端中的合成层（Compositing Layer）与渲染性能优化原创"
[4]: https://cloud.tencent.com/developer/article/2286382?utm_source=chatgpt.com "css布局优化：布局计算限制— contain/will-change/合成层 - 腾讯云"

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

# 浏览器内核 -webkit-xxx

好的，我来详细介绍以 `-webkit-` 开头的 CSS 属性。这些是**浏览器私有前缀**，主要用于实现实验性的 CSS 功能。

## 一、什么是 -webkit- 前缀？

`-webkit-` 是 WebKit 浏览器引擎的私有前缀。主要用于：

- **实验性功能**：在标准确定前的实验性实现
- **浏览器兼容**：不同浏览器对新兴特性的实现
- **渐进增强**：为特定浏览器提供额外功能

### 主要使用 -webkit- 前缀的浏览器：

- **Safari** (所有版本)
- **Chrome** (旧版本，新版逐渐减少依赖)
- **Edge** (基于 Chromium 的版本)
- **Opera** (基于 Chromium 的版本)
- **iOS 浏览器** (所有浏览器，因必须使用 WebKit)
- **Android 浏览器**

## 二、常见的 -webkit- 属性分类

### 1. 外观和视觉效果

#### -webkit-appearance

```css
/* 移除原生控件样式 */
button {
  -webkit-appearance: none;
  appearance: none; /* 标准属性 */
}

/* 不同外观 */
.element {
  -webkit-appearance: button; /* 按钮样式 */
  -webkit-appearance: textfield; /* 输入框样式 */
  -webkit-appearance: none; /* 无样式 */
}
```

#### -webkit-tap-highlight-color

```css
/* 设置移动端点击高亮颜色 */
button,
a {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1); /* 浅灰色 */
  -webkit-tap-highlight-color: transparent; /* 完全透明，移除高亮 */
}
```

#### -webkit-user-select

```css
/* 控制文本选择 */
.element {
  -webkit-user-select: none; /* 不可选择 */
  -webkit-user-select: text; /* 可以选择 */
  -webkit-user-select: all; /* 点击选择全部 */
  user-select: none; /* 标准属性 */
}
```

### 2. 滚动相关属性

#### -webkit-overflow-scrolling

```css
/* 启用惯性滚动 (iOS) */
.scroll-container {
  overflow: auto;
  -webkit-overflow-scrolling: touch; /* 流畅滚动 */
}
```

#### ::-webkit-scrollbar 系列 (自定义滚动条)

```css
/* 整个滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

/* 滑块悬停状态 */
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 滚动条按钮 (上下箭头) */
::-webkit-scrollbar-button {
  display: none; /* 隐藏按钮 */
}

/* 角落 */
::-webkit-scrollbar-corner {
  background: #f1f1f1;
}
```

### 3. 输入框和表单控件

#### ::-webkit-input-placeholder

```css
/* 输入框占位符样式 */
input::-webkit-input-placeholder {
  color: #999;
  font-style: italic;
}

/* 标准写法需要分开 */
input::placeholder {
  color: #999;
  font-style: italic;
}

input::-moz-placeholder {
  color: #999;
  font-style: italic;
}
```

#### -webkit-text-size-adjust

```css
/* 防止移动端文本自动调整大小 */
html {
  -webkit-text-size-adjust: 100%; /* 保持原始大小 */
  -webkit-text-size-adjust: none; /* 禁用调整 */
  text-size-adjust: 100%; /* 标准属性 */
}
```

#### -webkit-autofill 伪类

```css
/* 修改浏览器自动填充的样式 */
input:-webkit-autofill {
  background-color: #f0f8ff !important;
  -webkit-box-shadow: 0 0 0px 1000px white inset;
  -webkit-text-fill-color: #333;
}

/* 移除自动填充的黄色背景 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px white inset;
  transition: background-color 5000s ease-in-out 0s;
}
```

### 4. 变换和动画

#### -webkit-backface-visibility

```css
/* 3D 变换时背面可见性 */
.card {
  -webkit-backface-visibility: hidden; /* 隐藏背面 */
  backface-visibility: hidden; /* 标准属性 */
}
```

#### -webkit-transform 系列

```css
/* 3D 变换 */
.element {
  -webkit-transform: translate3d(0, 0, 0); /* 开启硬件加速 */
  -webkit-transform-style: preserve-3d;
  -webkit-perspective: 1000px;

  transform: translate3d(0, 0, 0); /* 标准属性 */
  transform-style: preserve-3d;
  perspective: 1000px;
}
```

### 5. 字体和文本渲染

#### -webkit-font-smoothing

```css
/* 字体抗锯齿 (macOS) */
body {
  -webkit-font-smoothing: antialiased; /* 抗锯齿 */
  -webkit-font-smoothing: subpixel-antialiased; /* 子像素抗锯齿 */
  -moz-osx-font-smoothing: grayscale; /* Firefox macOS */
}
```

#### -webkit-text-stroke

```css
/* 文字描边 */
.heading {
  -webkit-text-stroke: 1px #000; /* 描边宽度和颜色 */
  -webkit-text-fill-color: transparent; /* 填充透明 */
  color: white; /* 备用颜色 */
}

/* 标准替代方案 */
.heading {
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0
      #000;
}
```

### 6. 移动端特定属性

#### -webkit-touch-callout

```css
/* 禁止长按弹出菜单 (iOS) */
img,
a {
  -webkit-touch-callout: none; /* 禁止菜单 */
  -webkit-touch-callout: default; /* 允许菜单 */
}
```

## 三、伪元素和伪类

### 1. 输入框伪元素

```css
/* 搜索框的清除按钮 */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  height: 1em;
  width: 1em;
  background: url("clear-icon.svg") no-repeat;
}

/* 密码框的显示密码按钮 */
input[type="password"]::-webkit-credentials-auto-fill-button {
  background-color: red;
}

/* 日期时间选择器 */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1); /* 反转颜色 */
}
```

### 2. 媒体控制伪元素

```css
/* 视频播放器控件 */
video::-webkit-media-controls-panel {
  background-color: rgba(0, 0, 0, 0.7);
}

video::-webkit-media-controls-play-button {
  background-color: red;
}

video::-webkit-media-controls-timeline {
  background-color: transparent;
}
```

## 四、实际应用示例

### 1. 移动端优化组合

```css
.mobile-element {
  /* 移除默认样式 */
  -webkit-appearance: none;
  appearance: none;

  /* 优化触摸体验 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  /* 文本优化 */
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;

  /* 滚动优化 */
  -webkit-overflow-scrolling: touch;
}
```

### 2. 自定义输入框

```css
.custom-input {
  /* 移除默认样式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* 占位符样式 */
  &::-webkit-input-placeholder {
    color: #ccc;
    font-style: italic;
  }

  &::-moz-placeholder {
    color: #ccc;
    font-style: italic;
  }

  /* 自动填充样式 */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px #f8fff8 inset;
    -webkit-text-fill-color: #2a2a2a;
  }
}
```

### 3. 自定义滚动条

```css
.custom-scrollbar {
  overflow: auto;
  max-height: 300px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}
```

## 五、现代开发最佳实践

### 1. 使用 PostCSS 自动添加前缀

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require("autoprefixer")({
      overrideBrowserslist: ["last 2 versions", "iOS >= 10", "Android >= 5"],
    }),
  ],
};
```

### 2. CSS 编写顺序

```css
.element {
  /* 标准属性在前 */
  appearance: none;
  user-select: none;

  /* 私有前缀在后 */
  -webkit-appearance: none;
  -moz-appearance: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
```

### 3. 特性检测

```javascript
// 检测是否支持标准属性
function supportsCSS(property, value) {
  if (typeof CSS !== "undefined" && CSS.supports) {
    return CSS.supports(property, value);
  }

  // 回退方案
  const element = document.createElement("div");
  element.style[property] = value;
  return element.style[property] === value;
}

// 使用
if (supportsCSS("appearance", "none")) {
  // 使用标准属性
} else {
  // 使用前缀属性
}
```

## 六、注意事项

1. **逐渐淘汰**：现代浏览器对很多属性已经支持标准写法
2. **性能考虑**：某些 -webkit- 属性可能影响性能
3. **标准优先**：始终先写标准属性，再写前缀属性
4. **测试覆盖**：需要在目标浏览器中充分测试
5. **文档参考**：使用 caniuse.com 检查兼容性

随着 Web 标准的发展，越来越多的 `-webkit-` 前缀属性正在被标准属性取代，但在移动端和特定场景下，它们仍然是必不可少的。
