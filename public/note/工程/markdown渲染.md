# 流式

非常好的问题，这其实是**流式 Markdown 渲染（streaming markdown rendering）**领域里最核心、最难的问题之一 💡
尤其是当你想实现类似 **ChatGPT / Claude / Copilot** 那样的“边生成边渲染”的效果时，必须解决：

> ⚠️ Markdown 流数据不完整时（例如代码块未闭合），如何保证**提前渲染出正确的结构**并**在后续补全时动态更新**。

下面我会详细讲：

1. 🚧 问题本质
2. 💡 常见错误方案（为什么 naive 的做法不行）
3. ✅ 几种可行的渲染架构思路（含优缺点）
4. ⚙️ 实现建议与现成方案

---

## 🚧 一、问题本质

流式输出时，你收到的 Markdown 数据可能是**不完整的片段**：

````text
"Here is an example:\n\n```js\nconst a = 1"
````

此时还没有闭合的 “```”，
如果直接用 `marked`/`react-markdown` 去渲染，会导致：

- ⚠️ 渲染中断（解析错误）
- ⚠️ DOM 被频繁销毁重建
- ⚠️ 样式错乱（因为 `<pre><code>` 未闭合）

所以，要实现 ChatGPT 那种 **“代码块一出现就立刻渲染高亮，但仍能继续往下更新”** 的效果，需要特殊的流式解析逻辑。

---

## 💡 二、错误方案（以及为什么不行）

### ❌ 方案 1：每次全量重渲染

```tsx
setMarkdown((prev) => prev + chunk);
```

然后重新用 `react-markdown` 渲染。

问题：

- 每次 chunk 都会重新 parse 全文 → 极慢。
- 不完整的 Markdown（如代码块未闭合）会解析失败。
- React diff 开销大。

---

### ❌ 方案 2：用正则检测「```」然后手动包裹代码块

问题：

- Markdown 嵌套复杂（例如 blockquote + code）
- 多语言代码块（`js、`python）需要上下文才能知道边界
- 无法正确应对 escape、inline code、list 嵌套

---

## ✅ 三、可行架构方案

### 🧠 方案 1：**“渐进式 Markdown 流解析器” + 局部渲染**

核心思路：

- 写一个「流式 Markdown tokenizer」
- 按行解析输入，维护一个「解析状态机」
- 每次新 chunk 到达时，只更新最后的 block

#### 🔧 状态机示例：

| 状态         | 含义                | 结束条件                  |
| ------------ | ------------------- | ------------------------- |
| `text`       | 普通文本            | 行以 ```开始 → 进入`code` |
| `code(js)`   | 代码块中（语言 js） | 行以 ```结束 → 回到`text` |
| `blockquote` | 引用中              | 遇到空行 → 退出           |

#### 伪代码：

````ts
for each line in newChunk:
  if line.startsWith("```") and !inCode:
    inCode = true
    lang = extractLanguage(line)
    openNewBlock({ type: 'code', lang })
  else if line.startsWith("```") and inCode:
    inCode = false
    closeBlock()
  else:
    appendToCurrentBlock(line)
````

这样，你能在**检测到 ```js** 时立即开始渲染一个 `<CodeBlock>` 组件，
即使内容还没结束，也能先显示「高亮中的代码区」。

**后续流继续到达时**：

- 若还在代码块中 → 继续向 `<CodeBlock>` 传递内容。
- 一旦检测到结束符 → 锁定该块并转为静态渲染。

🟢 优点：

- 渲染流畅（每个 block 只更新自身）
- 无需重新 parse 全文
- 代码块、列表、标题都能即时展示

🔴 缺点：

- 实现复杂，需要维护解析状态机

👉 **ChatGPT / Copilot 等实现的核心方案。**

---

### ⚙️ 方案 2：**渐进式 Markdown → JSON AST（分块更新）**

借助工具：

- [`micromark`](https://github.com/micromark/micromark)
- [`remark-parse` + `unist-builder`]
- 或自定义 parser，将 Markdown 解析成「部分 AST 节点树」

核心思想：

- 每个新 chunk 都交给 parser 去生成新节点（如 paragraph / code / heading）
- 合并到旧 AST
- 渲染层 diff AST → React 渲染

示例结构：

```json
[
  { "type": "paragraph", "value": "Hello" },
  { "type": "code", "lang": "js", "value": "const a = 1" }
]
```

当新 chunk 到来：

```json
{ "type": "code", "lang": "js", "value": "const a = 1;\nconst b = 2;" }
```

渲染层 diff 后只更新 `code` 节点。

🟢 优点：

- 可视化控制更强，可持久化
- 代码块、表格、列表可精细控制更新
- 方便后期做复制、折叠、语法高亮

🔴 缺点：

- AST 合并逻辑复杂
- 流程长（Markdown → Token → Node → React）

---

### ⚙️ 方案 3：**流式渲染 + Markdown 后置解析**

另一种思路：

- 先把所有 chunk 按行原样渲染成 `<pre>` 文本；
- 同时异步 parse 已完成部分 Markdown；
- 一旦检测到结构完整（如闭合了 ```），替换掉对应区域的节点。

🧩 实现方式：

- `<div dangerouslySetInnerHTML>` 临时渲染纯文本
- 检测闭合时调用 parser + diff DOM → 替换区域

🟢 优点：

- 实现简单（无需重写 parser）
- 体验不错（代码块出现后立刻替换成高亮版本）

🔴 缺点：

- 短暂的“纯文本 → 格式化”闪烁
- DOM 替换复杂，维护性差

---

## 💡 四、推荐技术栈组合

| 场景                      | 推荐实现                            |
| ------------------------- | ----------------------------------- |
| Web 聊天流（ChatGPT 类）  | ✅ 状态机式流解析 + React 增量渲染  |
| SSR + 流式输出（Next.js） | ✅ 使用 micromark 流式 tokenizer    |
| 移动端（React Native）    | ✅ 按块增量更新（不建议全量 parse） |

常用配套：

- **代码高亮**：`react-syntax-highlighter`、`shiki`、`highlight.js`
- **Markdown 工具链**：`micromark`、`remark-parse`、`markdown-it`
- **性能优化**：块级渲染、`memo`、虚拟列表

---

## 🧱 五、实际工程架构推荐

一个实战级结构（类似 ChatGPT）：

```
MessageRenderer.tsx
 ├─ useStreamParser()          ← 流式 Markdown tokenizer（状态机）
 ├─ MessageBlockList.tsx       ← 渲染已完成的 block
 ├─ MessageBlockCode.tsx       ← 高亮代码块（即使未闭合）
 ├─ MessageBlockText.tsx       ← 普通文本段
 ├─ MessageBlockPending.tsx    ← 渲染正在生成中的 block
```

每个 `block` 的数据结构：

```ts
type MessageBlock = {
  id: string;
  type: "text" | "code";
  lang?: string;
  content: string;
  complete: boolean;
};
```

当流到达时：

```ts
addChunk(chunk: string) {
  parseMarkdownLines(chunk);
  updateLastBlock();
}
```

React 层监听 block list 的变化，只更新最后的 block。

---

## ✅ 六、总结建议

| 目标                 | 推荐方案                        |
| -------------------- | ------------------------------- |
| 简单实现             | 方案 3（后置解析）              |
| 中大型项目           | 方案 1（状态机解析 + 增量渲染） |
| 专业 Chat 系统       | 方案 2（AST + Block Diff）      |
| SSR / Next.js Stream | micromark 流解析                |

---

如果你希望我帮你：

> 💻 给出一个 **React 流式 Markdown 渲染 demo（含代码块提前渲染 + 自动闭合更新）**

我可以直接帮你写出一个可运行的 React 组件（用 `useStreamParser` 模拟流输入），
并演示代码块的即时高亮更新。

是否要我帮你生成这个示例？

# 详细实现

好——下面我把 **“渐进式 Markdown 流解析器 + 局部渲染”** 这个方案全面拆解成概念、状态机、数据结构、算法、完整可运行的 React + TypeScript 示例（hook + 渲染组件），以及工程注意点与进阶优化建议。目标是：**在接收不完整流（chunk）时能立即把代码块、段落等“块级结构”渲染出来，并在后续 chunk 到达时只更新受影响的块而不是重解析全部内容**。

我会先解释原理与状态机，再给出实现代码，最后列出大量工程级注意点与扩展方案。准备好了就开始——

## 一、方案概览（为什么可行）

流式渲染的核心是**按块（block）增量更新**：把 Markdown 文档分割成一系列独立的块（例如：段落、行内文本、代码块、标题、列表项、blockquote 等），接着对每次到达的新数据只解析并更新**尾部一个或少数几个块**，从而避免每次都全量解析。

关键要点：

- 使用**行级分割（按换行）**作为最小增量单元，维护一个**未结束行缓冲区**（partialLine buffer）。
- 用**状态机**（state）跟踪当前是否在 `fenced code block`、`list`、`blockquote` 等上下文中。
- 将解析结果表示成 `Block[]`，每个 block 拥有 `id/type/content/lang/complete`，React 用 `key=block.id` 渲染，**只更新最后一个 block 的内容**（或少量受影响 block）。
- 代码块一旦检测到开头（例如行以 ```````开头），就立即创建一个`code` block 并渲染其容器（可以先显示占位高亮，再在内容追加时做高亮更新）。
- 当最终检测到闭合符（```````）时将该 block 标记为 `complete`，并可把它转换为最终渲染（或对其内容做最终高亮/语法解析）。

## 二、状态机（最简但覆盖核心场景）

为流式解析我们维护一个 `parserState`，主要状态包括：

- `NORMAL` — 普通文本（段落/标题/列表/blockquote 都可在此处理）
- `CODE_FENCE` — 在 fenced code block 中（记录 `lang`）
- `INDENTED_CODE` — 缩进代码块（可选）
- `HTML_BLOCK` — 原始 HTML 块（如果需要）
- `EOF_BUFFER` — 当前 chunk 的最后一行未以换行结束（buffer 保存）

Transitions（示例）：

- `NORMAL` 遇到以 ```````开始的行 →`CODE_FENCE`（创建 code block）
- `CODE_FENCE` 遇到以 ```````结束的行 → 回到`NORMAL`（关闭 code block）
- `NORMAL` 遇到以 `>` 开头的行 → 建立/追加 `blockquote` block
- `NORMAL` 遇到 `- ` 或 `* ` 开头 → list item（可合并多个 item 为 list block）
- 行未以 `\n` 结尾 → 保留在 `partialLineBuffer` 中，下次 chunk 合并处理

## 三、数据结构（TypeScript）

```ts
type BlockType = "text" | "code" | "heading" | "list" | "blockquote" | "html";

type Block = {
  id: string;
  type: BlockType;
  content: string; // 累积文本（不带尾部换行）
  lang?: string; // code block 的语言，例如 "js"
  meta?: any; // 额外信息（如 list 项）
  complete: boolean; // 标志块是否已经“结束”（不再接收更多数据）
};
```

## 四、核心算法（伪逻辑）

每次接收 `chunk` 调用 `feed(chunk)`：

1. 把 `partialLineBuffer + chunk` 合并为 `data`。
2. 按 `\n` 切分成多行 `lines`，如果 `data` 不以 `\n` 结尾，最后一行放回 `partialLineBuffer`，其余逐行解析。
3. 对每一行做简单的模式判断（fence、heading、list、blockquote、normal），并根据当前 `state` 决定：

   - 新建 block（例如检测到 code-fence 开始）
   - 向当前 block 追加行（例如在 code state 或 list item 中）
   - 关闭当前 block（例如 code-fence 结束），标记 `complete = true`

4. 返回改变后的 `blocks`（React 层只对发生变化的 blocks 做更新）。

重要：解析器只解析行级语法并维护 block 边界，不做完整的 markdown->html 转换（渲染时可把 block 内容交给成熟的 Markdown 渲染器做局部渲染或用代码高亮器仅渲染 code block）。

## 五、完整实现示例（React + TypeScript）

下面给出一个尽量完整但仍精简的示例实现，包含：

- `useStreamParser` hook：流式解析器（行级、fenced code 支持、partial buffer）
- `StreamingMarkdown` 组件：基于 `blocks` 渲染，每个 block 用独立子组件，代码块即时渲染并支持后续追加
- 简单代码高亮（使用 `highlight.js` 客户端 API）；我会做为示例使用 `highlight.js` 的同步高亮（如需更漂亮的 shiki 可做异步替换）

> 注意：下面示例省略样式与网络插件安装的细节。你可以按需替换高亮库（`shiki` 更佳但需要异步与 WebWorker），以及用 `DOMPurify` 做 HTML 清洗。

````tsx
// useStreamParser.ts
import { useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

type BlockType = "text" | "code" | "heading" | "list" | "blockquote";
type Block = {
  id: string;
  type: BlockType;
  content: string;
  lang?: string;
  complete: boolean;
};

export function useStreamParser() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const stateRef = useRef({
    mode: "NORMAL" as "NORMAL" | "CODE_FENCE",
    fenceLang: "" as string,
    partialLine: "" as string,
  });

  const pushNewBlock = (
    type: BlockType,
    initialContent = "",
    lang?: string
  ) => {
    const b: Block = {
      id: uuidv4(),
      type,
      content: initialContent,
      lang,
      complete: false,
    };
    setBlocks((prev) => [...prev, b]);
    return b;
  };

  const appendToLastBlock = (text: string) => {
    setBlocks((prev) => {
      if (prev.length === 0) {
        return [{ id: uuidv4(), type: "text", content: text, complete: false }];
      }
      const last = prev[prev.length - 1];
      const updated = {
        ...last,
        content: last.content + (last.content.length ? "\n" : "") + text,
      };
      return [...prev.slice(0, -1), updated];
    });
  };

  const closeLastBlock = () => {
    setBlocks((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, complete: true }];
    });
  };

  const feed = useCallback((chunk: string) => {
    const st = stateRef.current;
    const combined = st.partialLine + chunk;
    const lines = combined.split(/\n/);
    // if last char is not newline, keep last as partial
    const endsWithNewline = combined.endsWith("\n");
    const processLines = endsWithNewline ? lines : lines.slice(0, -1);
    st.partialLine = endsWithNewline ? "" : lines[lines.length - 1];

    for (let rawLine of processLines) {
      const line = rawLine.replace(/\r$/, ""); // normalize CRLF
      if (st.mode === "NORMAL") {
        // detect fenced code begin: ```lang or ```
        const m = line.match(/^```(\S*)\s*$/);
        if (m) {
          st.mode = "CODE_FENCE";
          st.fenceLang = m[1] || "";
          // create code block
          pushNewBlock("code", "", st.fenceLang);
          continue;
        }
        // heading
        if (/^#{1,6}\s+/.test(line)) {
          pushNewBlock("heading", line.replace(/^#{1,6}\s+/, ""));
          closeLastBlock();
          continue;
        }
        // blockquote
        if (/^\s*>\s?/.test(line)) {
          const text = line.replace(/^\s*>\s?/, "");
          // append or new block
          const last = blocksRef((blocks) => blocks[blocks.length - 1]);
          // simpler: just push new block for each blockquote line for now
          pushNewBlock("blockquote", text);
          continue;
        }
        // list item
        if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
          pushNewBlock("list", line.replace(/^\s*([-*+]|\d+\.)\s+/, ""));
          continue;
        }
        // normal text — append to last text block
        appendToLastBlock(line);
      } else if (st.mode === "CODE_FENCE") {
        // detect fenced code end
        if (/^```\s*$/.test(line)) {
          // close code block
          closeLastBlock(); // mark last (code) as complete
          st.mode = "NORMAL";
          st.fenceLang = "";
          continue;
        } else {
          // append literal code line to code block
          appendToLastBlock(line);
          continue;
        }
      }
    }
  }, []);

  // helper to safely get last block in setState callbacks
  const blocksRef = (fn: (cur: Block[]) => Block | undefined) => {
    // not ideal — we can instead return last via setState callback - for brevity left as note
    return undefined;
  };

  return {
    blocks,
    feed,
    // flush partial buffer (e.g., on stream end)
    flush: () => {
      const st = stateRef.current;
      if (st.partialLine) {
        appendToLastBlock(st.partialLine);
        st.partialLine = "";
      }
      // mark last block complete if needed
      // close code block if still open
      if (st.mode === "CODE_FENCE") {
        // still open; mark complete anyway (or keep open depending on policy)
        closeLastBlock();
        st.mode = "NORMAL";
      }
    },
  };
}
````

上面是核心解析 hook 的简化实现（真实工程中需要把 `blocksRef` 和 `setBlocks` 的并发问题处理更严谨；也要处理合并多个行到同一个 block 的逻辑，例如连续普通行应合并成一个 `text` block，而不是每行一个 block）。下面给出更完整的渲染组件示例，展示如何只更新最后一个 block。

````tsx
// StreamingMarkdown.tsx
import React from "react";
import { useStreamParser } from "./useStreamParser";
import hljs from "highlight.js"; // npm i highlight.js

function CodeBlock({ content, lang }: { content: string; lang?: string }) {
  const ref = React.useRef<HTMLPreElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    // highlight.js auto-detect if lang not specified
    const codeEl = ref.current.querySelector("code");
    if (!codeEl) return;
    if (lang) {
      try {
        (codeEl as HTMLElement).innerHTML = hljs.highlight(content, {
          language: lang,
        }).value;
      } catch {
        (codeEl as HTMLElement).innerText = content;
      }
    } else {
      try {
        (codeEl as HTMLElement).innerHTML = hljs.highlightAuto(content).value;
      } catch {
        (codeEl as HTMLElement).innerText = content;
      }
    }
  }, [content, lang]);
  return (
    <pre ref={ref} className="stream-code">
      <code>{content}</code>
    </pre>
  );
}

function TextBlock({ content }: { content: string }) {
  // we can use a lightweight inline markdown renderer for text block
  // for demo we just render text with simple newline -> <br/>
  return (
    <div className="stream-text">
      {content.split("\n").map((ln, i) => (
        <div key={i}>{ln}</div>
      ))}
    </div>
  );
}

export function StreamingMarkdownDemo() {
  const { blocks, feed, flush } = useStreamParser();

  // simulate streaming
  React.useEffect(() => {
    const chunks = [
      "Here is some text.\n\n```js\nconst a = 1\n",
      "console.log(a);\n",
      "```\n\nAnd another paragraph\n",
    ];
    let i = 0;
    const t = setInterval(() => {
      if (i >= chunks.length) {
        flush();
        clearInterval(t);
        return;
      }
      feed(chunks[i]);
      i++;
    }, 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {blocks.map((b) => {
        if (b.type === "code")
          return <CodeBlock key={b.id} content={b.content} lang={b.lang} />;
        return <TextBlock key={b.id} content={b.content} />;
      })}
    </div>
  );
}
````

这个演示会：收到第一 chunk 时识别并创建 code block（并立即渲染空 code 区域）；后续 chunk 到来时继续往该 code block 追加内容并高亮更新；当接收到结尾符号后把该 block 标为完成。

**注意**：示例中 `useStreamParser` 为简化版，工程化时需补充很多细节（见后文）。

## 六、工程化注意点与扩展（详尽清单）

下面列出你在真实项目中必须考虑的实践细节、性能/UX/安全问题，以及可选的进阶优化。

### 1) 按块合并策略（避免太细粒度）

不要把每一行都当作独立 block（会导致 DOM 爆炸与 diff 问题）。建议：

- 普通文本：连续文本行合并成一个 `text` block（用 `\n` 分隔内部行）
- list：把连续的 list item 合并成 `list` block（内部维护 `items[]`）
- blockquote：连续 `>` 行合并

### 2) Partial-line buffer（关键）

- 每次 chunk 可能不以 `\n` 结尾：保留最后一段 `partial`，在下次 `feed` 合并解析。
- 举例：chunk1 为 `console.log(a);`（无换行），chunk2 为 ` \n```  ` —— 若没有 buffer，你会错过行边界。

### 3) 代码块边界检测

- fenced code: ` ^```(\S*)\s*$ ` 开始/结束（注意语言可能缺失）。
- 要处理“转义 `”的情况（极少见但可能），以及在 code 内部出现 `（例如 code 内容本身包含 ```），这时按照 Markdown 规范，必须匹配最长的 fence（可实现更复杂的 fence-length 检测）。

### 4) 更新最小集（只渲染受影响 block）

- React 层使用 `block.id` 作为 key，每次只替换最后一个 block（或少数关闭/开启 block 的那几个）。
- 如果你用 `setBlocks(prev => { ... })`，要尽量在回调中只修改必要项，避免创建新数组导致所有子组件重新渲染（可以 `memo` 各个 Block 组件）。

### 5) 代码高亮策略（性能/体验折中）

- 客户端同步高亮（highlight.js）简单、快，但样式/准确度有限。
- `shiki` 提供更漂亮的高亮但是异步（WebAssembly），可以在 Worker 中执行：

  - 初始渲染：把 raw text 放入 `<pre><code>`（无高亮）
  - 异步高亮：在后台对最新 block 做高亮，替换 innerHTML（不阻塞 UI）

- 关键是：**不要在每个字符来时都触发高亮**，而应在块内内容更新节流（debounce）或仅对最后一个 block 的增量更新做局部高亮。

### 6) 安全（XSS）

- 当你把 Markdown 渲染为 HTML（或把高亮器输出 innerHTML）时，必须使用 `DOMPurify` 等工具清洗 HTML（尤其是 server/remote 内容）。
- 对 code block 通常不用 sanitize（只是纯文本转义后放入 code 元素），但如果把 Markdown 转成 HTML，必须 sanitize。

### 7) 嵌套结构（复杂场景）

- 嵌套列表、引用内代码等需要更复杂的状态机或部分 AST 合并逻辑。
- 对于复杂 Markdown（例如表格、多级列表），建议：

  - 先用行级状态机保证块级正确（fenced code、list、blockquote、heading）
  - 对已经“complete”的 block 交给成熟的 Markdown 渲染器（remark/rehype）或针对该 block 的局部解析器渲染更复杂内容

### 8) 服务器端 / SSR 场景

- 如果在 SSR 中也要支持 streaming（例如 Next.js 的流式响应），可在 server 端维持相同的解析逻辑并发出 HTML 段，但通常 SSR 更适合发送已完成的首屏内容，客户端再接管后续流更新。

### 9) 流断开或错误处理

- 当 stream 意外断开，决定策略：

  - 自动把未闭合的代码块“软关闭”，并将它标为 `complete`（避免长时间保留打开状态）
  - 或者显示“正在生成中”的 UI（例如 loading 指示），并在后续重连/追加时恢复

### 10) 编辑/复制/选择行为

- 用户可能想复制代码片段或在生成过程中选取文本，确保在局部替换高亮时不会破坏 selection。通常做法：

  - 尽量只更新 `innerHTML` 而不是移除 DOM 节点（可通过 `ref` + `innerHTML` 替换）
  - 或者在替换前保存 selection，再恢复（复杂）

### 11) 国际化 / RTL 支持

- 对于 RTL 语言（阿拉伯语），确保 code/text block 的 `dir` 属性正确。

### 12) 测试（单元与集成）

- 单测你的 parser：基于各种切分点（边界在 fence 开始/中间/结尾）来写用例。
- 集成测试：模拟不同 chunk 大小（按单字符、按单词、按句）来确保解析器健壮。

## 七、示例用例与 edge-case 解析

举几个常见 tricky case，与解析器应该如何处理：

1. chunk1 = "`` js\nconsole.log("  chunk2 = `"Hello")\n ``\n`

   - 处理：partialLine buffer 保存最后不完整的行 `console.log(`，下次合并为完整行。

2. chunk 切在 fence 本身：

   - chunk1 = "Here\n```j" chunk2 = "s\nconst a=1\n"
   - 处理：要支持 fence 行被分割的情况（即部分 fence 在 partialLine），所以当检测 fence start 时需要允许 `partialLine` 拼接到 next chunk。

3. code 内含类似 fence 的行：

   - Markdown 规范：若 fence 使用 3 个反引号，code 内有 3 个反引号则可能需要更长的 fence 来包裹。简单实现可假设 fence 长度固定为 3 并把 code 内三反引号当普通文本处理（足够多数场景）。若需要严格遵守，需记录 fence 长度并匹配相同长度的结束 fence。

## 八、性能建议（大规模流时）

- **批量更新**：对高频到达的 chunk 进行 throttle/debounce（例如 50–150ms），合并多次输入再处理，减少渲染频率。
- **虚拟化**：若消息很多或每条消息都很长，结合虚拟列表（react-window/react-virtual）避免 DOM 爆炸。
- **Memoization**：把 Block 组件用 `React.memo` 包裹，仅在其 props 变化时重新渲染。
- **Worker**：把 heavyweight parsing / highlighting 下放到 WebWorker（尤其是 `shiki`），主线程只做最小 DOM 更新。

## 九、扩展想法（高级功能）

- **增量 AST**：把每个 block 进一步解析成局部 AST（例如用 remark 解析已经 complete 的 block），方便做语法高亮、复制或结构化操作。
- **编辑回放**：维护每个 block 的时间线（timestamp），可以做“回放生成过程”的 UI。
- **差分高亮**：只给新追加的几行做高亮，而不是整个 block，减少工作量（需要高亮器支持局部高亮或分段渲染）。
- **断点恢复**：当 stream 意外断开并重连时，后端发送 resume token，前端可以对比并只请求差量。

## 十、总结（实践建议）

- 对于 ChatGPT 类应用，我的推荐实现顺序：

  1. 实现基于行的**状态机解析器**（支持 fenced code、heading、list、blockquote），维护 `partialLine`。
  2. 将解析结果作为 `blocks` 数组，按 block 渲染（`key=block.id`），只更新最后 block。
  3. 代码高亮采用**异步 worker（shiki）**或轻量 `highlight.js`（先显示 raw code，后替换高亮结果）；对高频更新节流。
  4. 对已 complete 的 block 使用成熟的 Markdown 渲染器将其转成 HTML（并做 sanitize）；对正在生成中的 block 保持文本/预格式化渲染，避免解析错误。
  5. 写大量单测，覆盖分块边界、partialLine、各种切分策略。

---

如果你愿意，我可以**马上为你生成一个更完整、工程可运行的 demo 仓库结构和更完善的 `useStreamParser` 实现**（包括：

- 正确合并连续 text 行为单一 text block，
- list/blockquote 合并逻辑，
- fence 被 chunk 切断时的 robust 处理，
- 异步 shiki 高亮（web worker stub）示例，
- DOMPurify 安全示例）。

要我现在直接把那个工程化 demo 的源码写出来（包含所有细节、注释、测试用例）吗？
