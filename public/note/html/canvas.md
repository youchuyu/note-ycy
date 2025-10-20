# canvas 用户交互

很好 — 这是个非常实用的话题。Canvas（`<canvas>`）本身只是一个像素画布，**不像 DOM 那样每个元素自带事件**。要在 Canvas 上实现交互，需要把 DOM 事件映射到画布上的“对象”（形状、精灵、路径等），做点击检测（hit testing）、手势识别和状态管理。下面给你一套全面的思路、常见方法和可直接复制的示例代码（包含简单的 hit-test、拖拽、和“离屏色码”精确拾取方案），并附上性能与无障碍注意事项。

# 1. 基本思路（核心概念）

1. 在 `<canvas>` 上注册鼠标/触摸/指针事件（`pointerdown/move/up`、`mousedown/mousemove/mouseup`、`touchstart` 等）。
2. 将事件的客户端坐标转换为 Canvas 坐标（考虑设备像素比和 CSS 缩放）。
3. 在内存中维护一个“场景图”或对象列表（每个对象有边界、路径、id、渲染顺序等）。
4. 对这些对象做 **hit test**（碰撞检测）以找出被点击/触摸到的对象。
5. 根据结果触发相应业务逻辑（选择、拖拽、上下文菜单、hover 效果等）。
6. 用 `requestAnimationFrame` 做渲染循环以保持流畅动画与交互。

# 2. 常见的 hit-testing 方法

- **包围盒（AABB）检测**：简单/快，适用于矩形或近似形状。
- **`isPointInPath` / `isPointInStroke`**：Canvas API 原生路径检测，适用于复杂矢量路径。
- **像素/位图检测（离屏色码/ID 贴图）**：把每个对象渲染到离屏 canvas，用唯一颜色代表 id，通过读取像素获取被点中的对象。用于大量重叠或复杂形状的精确检测。
- **空间索引（四叉树/网格）**：当对象数量很多时，用空间索引加速查找候选对象。

# 3. 设备像素比与坐标转换（必须）

浏览器会缩放 canvas 的 CSS 大小与内部像素大小。正确转换非常重要：

```js
function getCanvasRelativePosition(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  return { x, y, dpr };
}
```

通常在初始化时把 canvas 的实际像素大小设为 `cssWidth * dpr`，并用 `ctx.scale(dpr, dpr)` 做绘制缩放。

# 4. 简单示例：基于 bounding-box 的点击与拖拽

```js
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const objects = [
  { id: 1, x: 20, y: 20, w: 120, h: 80, color: "tomato" },
  { id: 2, x: 180, y: 60, w: 140, h: 100, color: "skyblue" },
];

let dragObj = null;
let offset = { x: 0, y: 0 };

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const o of objects) {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }
}
draw();

function toCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

canvas.addEventListener("pointerdown", (e) => {
  const p = toCanvasPos(e);
  // 从上到下检测（确保拾取视觉上最上层）
  for (let i = objects.length - 1; i >= 0; i--) {
    const o = objects[i];
    if (p.x >= o.x && p.x <= o.x + o.w && p.y >= o.y && p.y <= o.y + o.h) {
      dragObj = o;
      offset.x = p.x - o.x;
      offset.y = p.y - o.y;
      canvas.setPointerCapture(e.pointerId);
      break;
    }
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragObj) return;
  const p = toCanvasPos(e);
  dragObj.x = p.x - offset.x;
  dragObj.y = p.y - offset.y;
  draw();
});

canvas.addEventListener("pointerup", (e) => {
  if (dragObj) {
    canvas.releasePointerCapture(e.pointerId);
    dragObj = null;
  }
});
```

# 5. 更精确：用 `isPointInPath` 检测任意路径

```js
function hitTestPath(pathFn, px, py) {
  ctx.beginPath();
  pathFn(ctx); // 绘制对象路径到 ctx（不填充）
  return ctx.isPointInPath(px, py) || ctx.isPointInStroke(px, py);
}
```

优点：不需要额外离屏 canvas；缺点：对于大量对象会慢（每次要重建路径）。

# 6. 高性能与像素精确：离屏色码（Color ID）法

思路：为每个对象分配一个不透明的唯一颜色（如 24-bit RGB），在离屏 canvas 上按对象绘制纯色（不抗锯齿），然后读取光标位置的像素颜色来得到对象 id。优点是速度快、精确且能处理复杂重叠；缺点是实现略复杂，需要处理像素读、颜色映射。

简单流程示例：

```js
// 离屏 canvas
const pickCanvas = document.createElement("canvas");
pickCanvas.width = canvas.width;
pickCanvas.height = canvas.height;
const pickCtx = pickCanvas.getContext("2d");

// 每个对象分配 colorId
objects.forEach((o, i) => {
  o._colorId = i + 1; // 1..N
  o._color = idToRGB(o._colorId); // e.g. {r,g,b}
});

function idToRGB(id) {
  const r = (id >> 16) & 0xff,
    g = (id >> 8) & 0xff,
    b = id & 0xff;
  return { r, g, b };
}

function pickAt(x, y) {
  pickCtx.clearRect(0, 0, pickCanvas.width, pickCanvas.height);
  for (const o of objects) {
    pickCtx.fillStyle = `rgb(${o._color.r},${o._color.g},${o._color.b})`;
    // 这里需要同主画布一致的坐标/变换逻辑
    pickCtx.fillRect(o.x, o.y, o.w, o.h);
  }
  const p = pickCtx.getImageData(x, y, 1, 1).data;
  const id = (p[0] << 16) | (p[1] << 8) | p[2];
  return objects.find((o) => o._colorId === id);
}
```

注意：要确保像素不受抗锯齿/alpha 影响，使用整像素坐标与不带 alpha 的绘制。读取像素会有开销，但通常仍然比遍历大量复杂路径快。

# 7. 手势、触摸与 Pointer Events

- 推荐使用 **Pointer Events（pointerdown/move/up）**，它统一了鼠标、触摸和笔。
- 对于旧浏览器需要回退到 `touch*` + `mouse*`。
- 用 `setPointerCapture` 在拖拽期间捕获指针，避免指针移出 canvas 时丢失事件：`canvas.setPointerCapture(e.pointerId)`。
- 对触摸事件常做 `e.preventDefault()`（尤其在移动端防止滚动），但要注意可访问性。

# 8. 鼠标滚轮、缩放和键盘交互

- `wheel` 事件处理缩放/滚动；配合 `ctrlKey/shiftKey` 判断复合操作。
- 键盘事件无法直接附到 canvas 上（canvas 本身不是可聚焦的元素），需要 `tabindex="0"` 或在页面上监听 `keydown` 并管理焦点。

```html
<canvas tabindex="0"></canvas>
```

# 9. 性能优化建议

- 使用 `requestAnimationFrame` 做渲染（避免在事件回调中直接同步重绘多次）。
- 合理分层（静态背景单独缓存为 bitmap），只重绘变动区域。
- 对大量对象使用空间索引（四叉树）与离屏色码配合。
- 节流/合并高频事件（pointermove）或在低优先级渲染中降帧。
- 在需要时使用 `OffscreenCanvas`（支持 web worker）来做复杂渲染。

# 10. 无障碍（Accessibility）与降级

Canvas 内部的内容对屏幕阅读器不可见：

- 提供 ARIA 替代（`<div role="img" aria-label="...">` 或隐藏的 DOM 描述）。
- 对关键控件，提供额外的键盘交互与 HTML 控件（或一个与 canvas 同步的 DOM 控件列表）。
- PWA/移动端注意触控目标大小与反馈。

# 11. 常用库（如果你不想从零实现）

- **Konva / react-konva**：2D 图形与事件处理，带场景图、事件与动画。
- **Fabric.js**：画板交互（选中、拖拽、缩放、旋转）很方便。
- **PixiJS**：高性能渲染与事件处理（适合游戏/渲染密集场景）。
- **Paper.js**：矢量图形与路径操作，带事件支持。

使用这些库可以避免自己实现复杂的 hit-testing、事件管理与高性能优化。

# 12. 小结（实用建议）

- 如果交互简单（几何形、少量对象），用 **bounding-box + isPointInPath** 即可。
- 若对象很多或形状复杂，优先考虑 **离屏色码** 或用现成库（Konva/Pixi）。
- 一定要正确处理 **坐标转换（devicePixelRatio）** 与 **Pointer Events**，并用 `requestAnimationFrame` 做渲染调度。
- 不要忘了 **键盘与无障碍替代方案**。

---

如果你愿意，我可以根据你的场景（例如：拖拽图形编辑器 / 大量精灵的游戏 / 矢量绘图工具）给出 **针对性的实现代码或性能方案**，并把示例封装成一个小库/Hook（例如 `useCanvasInteraction`）。想要哪个场景的示例？
