# ResizeObserver

好的，我来详细介绍 `ResizeObserver` 的使用。这是一个非常实用的 API，用于监听元素尺寸的变化。

## 一、什么是 ResizeObserver？

`ResizeObserver` 是一个现代的浏览器 API，它可以**监听元素内容矩形（content rectangle）或边框盒（border box）的尺寸变化**。它是传统 `window.resize` 事件的增强版，可以监听任意 DOM 元素的大小变化。

### 解决的问题：

- ✅ 监听任意元素（不只是 window）的尺寸变化
- ✅ 高性能，避免布局抖动
- ✅ 简单易用的 API
- ✅ 替代已废弃的 `MutationObserver` 监听尺寸变化

## 二、基本使用方法

### 1. 创建 ResizeObserver

```javascript
// 创建 ResizeObserver 实例
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log("元素尺寸发生变化:", entry);
  }
});

// 开始观察元素
const element = document.getElementById("myElement");
resizeObserver.observe(element);
```

### 2. 完整的简单示例

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .resizable {
        width: 200px;
        height: 100px;
        background: lightblue;
        resize: both;
        overflow: auto;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div class="resizable" id="resizableBox">拖拽我改变大小</div>
    <div id="output"></div>

    <script>
      const box = document.getElementById("resizableBox");
      const output = document.getElementById("output");

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          output.innerHTML = `
          <p>宽度: ${Math.round(width)}px</p>
          <p>高度: ${Math.round(height)}px</p>
          <p>时间: ${new Date().toLocaleTimeString()}</p>
        `;
        }
      });

      // 开始观察
      resizeObserver.observe(box);
    </script>
  </body>
</html>
```

## 三、ResizeObserverEntry 对象详解

回调函数中的 `entries` 参数是一个 `ResizeObserverEntry` 对象数组，包含以下重要属性：

### 1. contentRect

```javascript
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const contentRect = entry.contentRect;

    console.log("contentRect 属性:", {
      width: contentRect.width, // 内容宽度
      height: contentRect.height, // 内容高度
      x: contentRect.x, // 左上角 x 坐标
      y: contentRect.y, // 左上角 y 坐标
      top: contentRect.top, // 上边界
      right: contentRect.right, // 右边界
      bottom: contentRect.bottom, // 下边界
      left: contentRect.left, // 左边界
    });
  }
});
```

### 2. target

```javascript
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log("发生变化的元素:", entry.target);
    console.log("元素标签名:", entry.target.tagName);
    console.log("元素ID:", entry.target.id);
  }
});
```

### 3. borderBoxSize 和 contentBoxSize (现代浏览器)

```javascript
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // 现代浏览器支持 (返回数组，为未来支持片段做准备)
    if (entry.borderBoxSize && entry.borderBoxSize[0]) {
      const borderBox = entry.borderBoxSize[0];
      console.log("边框盒尺寸:", {
        inlineSize: borderBox.inlineSize, // 内联方向尺寸 (水平)
        blockSize: borderBox.blockSize, // 块方向尺寸 (垂直)
      });
    }

    if (entry.contentBoxSize && entry.contentBoxSize[0]) {
      const contentBox = entry.contentBoxSize[0];
      console.log("内容盒尺寸:", {
        inlineSize: contentBox.inlineSize,
        blockSize: contentBox.blockSize,
      });
    }

    // 回退到 contentRect
    if (!entry.borderBoxSize) {
      console.log("内容矩形:", entry.contentRect);
    }
  }
});
```

## 四、高级用法和实际场景

### 1. 监听多个元素

```javascript
class MultiElementObserver {
  constructor() {
    this.observer = new ResizeObserver(this.handleResize.bind(this));
    this.elements = new Map(); // 存储元素和对应的回调
  }

  // 添加监听元素
  observeElement(element, callback) {
    this.elements.set(element, callback);
    this.observer.observe(element);
  }

  // 移除监听元素
  unobserveElement(element) {
    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  // 处理尺寸变化
  handleResize(entries) {
    for (const entry of entries) {
      const callback = this.elements.get(entry.target);
      if (callback) {
        callback(entry);
      }
    }
  }

  // 销毁
  disconnect() {
    this.observer.disconnect();
    this.elements.clear();
  }
}

// 使用示例
const multiObserver = new MultiElementObserver();

const element1 = document.getElementById("element1");
const element2 = document.getElementById("element2");

multiObserver.observeElement(element1, (entry) => {
  console.log("Element1 尺寸变化:", entry.contentRect.width);
});

multiObserver.observeElement(element2, (entry) => {
  console.log("Element2 尺寸变化:", entry.contentRect.height);
});
```

### 2. 防抖处理

```javascript
class DebouncedResizeObserver {
  constructor(callback, delay = 100) {
    this.callback = callback;
    this.delay = delay;
    this.timeoutId = null;
    this.entries = [];

    this.observer = new ResizeObserver((entries) => {
      this.entries.push(...entries);
      this.scheduleCallback();
    });
  }

  scheduleCallback() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.callback(this.entries);
      this.entries = [];
    }, this.delay);
  }

  observe(element) {
    this.observer.observe(element);
  }

  unobserve(element) {
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

// 使用示例
const debouncedObserver = new DebouncedResizeObserver((entries) => {
  console.log("防抖后的尺寸变化:", entries.length);
}, 150);

debouncedObserver.observe(document.getElementById("myElement"));
```

### 3. 响应式组件示例

```javascript
class ResponsiveComponent {
  constructor(container) {
    this.container = container;
    this.breakpoints = {
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
    };
    this.currentBreakpoint = null;

    this.init();
  }

  init() {
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.handleResize(entry.contentRect.width);
      }
    });

    this.observer.observe(this.container);
    this.handleResize(this.container.offsetWidth);
  }

  handleResize(width) {
    const breakpoint = this.getBreakpoint(width);

    if (breakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = breakpoint;
      this.onBreakpointChange(breakpoint, width);
    }

    this.onResize(width);
  }

  getBreakpoint(width) {
    if (width >= this.breakpoints.xl) return "xl";
    if (width >= this.breakpoints.lg) return "lg";
    if (width >= this.breakpoints.md) return "md";
    if (width >= this.breakpoints.sm) return "sm";
    return "xs";
  }

  onBreakpointChange(breakpoint, width) {
    console.log(`断点变化: ${breakpoint}, 宽度: ${width}px`);

    // 移除旧类名
    this.container.classList.remove(
      "breakpoint-xs",
      "breakpoint-sm",
      "breakpoint-md",
      "breakpoint-lg",
      "breakpoint-xl"
    );

    // 添加新类名
    this.container.classList.add(`breakpoint-${breakpoint}`);

    // 触发自定义事件
    this.container.dispatchEvent(
      new CustomEvent("breakpointchange", {
        detail: { breakpoint, width },
      })
    );
  }

  onResize(width) {
    // 实时调整逻辑
    this.container.style.setProperty("--container-width", `${width}px`);
  }

  destroy() {
    this.observer.disconnect();
  }
}

// 使用示例
const component = new ResponsiveComponent(document.getElementById("app"));
```

### 4. 图表重绘优化

```javascript
class ChartRenderer {
  constructor(container, chartType = "line") {
    this.container = container;
    this.chartType = chartType;
    this.chart = null;
    this.isRendering = false;

    this.initResizeObserver();
    this.renderChart();
  }

  initResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (!this.isRendering) {
        this.isRendering = true;

        requestAnimationFrame(() => {
          this.handleChartResize(entries[0].contentRect);
          this.isRendering = false;
        });
      }
    });

    this.resizeObserver.observe(this.container);
  }

  handleChartResize({ width, height }) {
    console.log(`图表容器尺寸: ${width}x${height}`);

    // 重绘图表逻辑
    this.renderChart();
  }

  renderChart() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 模拟图表渲染
    this.container.innerHTML = `
      <div style="
        width: ${width}px; 
        height: ${height}px; 
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
      ">
        ${this.chartType} Chart: ${width}×${height}
      </div>
    `;
  }

  destroy() {
    this.resizeObserver.disconnect();
  }
}

// 使用示例
const chart = new ChartRenderer(document.getElementById("chart-container"));
```

## 五、实际应用场景

### 1. 响应式布局调整

```javascript
// 监听侧边栏和主内容区
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");

const layoutObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.target === sidebar) {
      // 侧边栏尺寸变化，调整主内容区
      mainContent.style.marginLeft = `${entry.contentRect.width}px`;
    } else if (entry.target === mainContent) {
      // 主内容区尺寸变化，调整布局
      updateContentLayout(entry.contentRect.width);
    }
  });
});

layoutObserver.observe(sidebar);
layoutObserver.observe(mainContent);
```

### 2. 虚拟列表优化

```javascript
class VirtualList {
  constructor(container, itemHeight = 50) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleItems = [];

    this.observer = new ResizeObserver(([entry]) => {
      this.updateVisibleItems(entry.contentRect.height);
    });

    this.observer.observe(container);
  }

  updateVisibleItems(containerHeight) {
    const visibleCount = Math.ceil(containerHeight / this.itemHeight);
    console.log(`可视区域可显示 ${visibleCount} 个项目`);
    // 更新虚拟列表渲染...
  }
}
```

### 3. 自适应字体大小

```javascript
class FluidTypography {
  constructor(element, minFontSize = 16, maxFontSize = 24) {
    this.element = element;
    this.minFontSize = minFontSize;
    this.maxFontSize = maxFontSize;
    this.minWidth = 320;
    this.maxWidth = 1200;

    this.observer = new ResizeObserver(([entry]) => {
      this.updateFontSize(entry.contentRect.width);
    });

    this.observer.observe(element);
    this.updateFontSize(element.offsetWidth);
  }

  updateFontSize(width) {
    const fontSize = this.calculateFluidSize(
      width,
      this.minWidth,
      this.maxWidth,
      this.minFontSize,
      this.maxFontSize
    );

    this.element.style.fontSize = `${fontSize}px`;
  }

  calculateFluidSize(current, minVw, maxVw, minSize, maxSize) {
    const ratio = (maxSize - minSize) / (maxVw - minVw);
    return Math.min(
      maxSize,
      Math.max(minSize, minSize + ratio * (current - minVw))
    );
  }
}

// 使用示例
new FluidTypography(document.querySelector(".responsive-heading"));
```

## 六、注意事项和最佳实践

### 1. 性能优化

```javascript
// 避免在回调中执行昂贵操作
const efficientObserver = new ResizeObserver((entries) => {
  // 使用 requestAnimationFrame 避免布局抖动
  requestAnimationFrame(() => {
    entries.forEach((entry) => {
      // 快速操作
      updateLayout(entry.contentRect);
    });
  });
});
```

### 2. 内存管理

```javascript
class ManagedResizeObserver {
  constructor() {
    this.observers = new Map();
  }

  observe(element, callback) {
    if (!this.observers.has(element)) {
      const observer = new ResizeObserver(callback);
      observer.observe(element);
      this.observers.set(element, observer);
    }
  }

  unobserve(element) {
    const observer = this.observers.get(element);
    if (observer) {
      observer.disconnect();
      this.observers.delete(element);
    }
  }

  disconnectAll() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}
```

### 3. 错误处理

```javascript
try {
  const observer = new ResizeObserver((entries) => {
    try {
      // 处理逻辑
    } catch (error) {
      console.error("ResizeObserver 回调错误:", error);
    }
  });

  observer.observe(element);
} catch (error) {
  console.error("ResizeObserver 创建失败:", error);
  // 降级方案
  window.addEventListener("resize", fallbackHandler);
}
```

## 七、浏览器兼容性

### 1. 特性检测

```javascript
if (typeof ResizeObserver !== "undefined") {
  // 使用原生 ResizeObserver
  const observer = new ResizeObserver(callback);
} else {
  // 降级方案
  console.warn("ResizeObserver 不支持，使用降级方案");
  // 可以使用 window.resize 或 polyfill
}
```

### 2. Polyfill

```bash
npm install resize-observer-polyfill
```

```javascript
import ResizeObserver from "resize-observer-polyfill";

// 现在可以安全使用
const observer = new ResizeObserver((entries) => {
  // 处理逻辑
});
```

ResizeObserver 是现代 Web 开发中非常有用的工具，特别适合构建响应式组件、可视化图表和自适应布局。合理使用可以显著提升用户体验和性能。
