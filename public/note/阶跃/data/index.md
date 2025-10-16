# Haiku

# Claude Code Router（ccr）

这段文字描述的是一个 **Claude Code Router（ccr）工具的配置文件修改说明**，用于在本地开发环境中自定义或切换 AI 模型（如 Qwen、Claude Sonnet 等）供代码助手或聊天代理调用。以下是详细分析：

---

## 一、上下文和用途

- **工具名称**：`claude-code-router`（简称 **ccr**）

  - 这是一个命令行工具，用于路由和代理多个 LLM（大语言模型）的请求。
  - 类似于一个“多模型代理层”，开发者可以通过它在不同的模型之间灵活切换（如本地自研模型、Qwen、Claude 等）。

- **配置文件路径**：`~/.claude-code-router/config.json`

  - 这是用户级别的全局配置文件，修改后通过 `ccr restart` 重启生效。

---

## 二、配置结构解析

### 1. Providers — 定义模型提供方

```json
"Providers": [
  {
    "name": "stepcast",
    "api_base_url": "http://stepcast-router-eval-common.stepfun-inc.com/v1/chat/completions",
    "api_key": "ak-",
    "models": [...]
  }
]
```

#### 含义：

- `stepcast` 是一个模型服务提供方（内部路由系统，属于 **StepFun / Stepcast 团队**）。
- 它提供了若干 **Qwen（阿里通义）系列的 8B 自研模型**。
- 每个模型都可以被路由器识别并转发请求。

---

### 2. transformer — 定义请求适配方式

```json
"transformer": {
  "qwen8b-toocall-0828-sft-v1-128k": {
      "use": ["OpenAI"]
  },
  ...
}
```

#### 含义：

- `transformer` 字段定义了“调用适配层”。

- `"use": ["OpenAI"]` 意味着：

  > 虽然底层模型不是 OpenAI 提供的，但它的接口格式与 OpenAI API (`/v1/chat/completions`) 兼容。

- 也就是说，这些模型可以通过 OpenAI SDK / API 格式调用，无需额外改造前端逻辑。

- 某些模型还带有：

  ```json
  ["maxtoken", { "max_tokens": 1000 }]
  ```

  表示附加一个 max_tokens 参数转换规则。

---

### 3. Router — 默认模型路由策略

```json
"Router": {
  "default": "stepcast,qwen8b-sft-0904baseline-128k-think",
  "background": "stepcast,qwen8b-sft-0904baseline-128k-think",
  "webSearch": "stepcast,qwen8b-sft-0904baseline-128k-think"
}
```

#### 含义：

- 指定了不同功能场景（default、background、webSearch）使用的默认模型。
- 格式：`<ProviderName>,<ModelName>`

  - 如：`stepcast,qwen8b-sft-0904baseline-128k-think` 表示：
    调用 `stepcast` 提供的 `qwen8b-sft-0904baseline-128k-think` 模型。

---

### 4. 运行命令

```bash
ccr restart
ccr code
```

- 修改完配置后通过 `ccr restart` 重载路由配置；
- 然后运行 `ccr code` 启动代码助手（通常是一个 VS Code 插件或命令行助手）。

---

## 三、提到的模型说明

| 模型名称                                             | 含义                         | 说明                                   |
| ---------------------------------------------------- | ---------------------------- | -------------------------------------- |
| **qwen8b-toocall-0828-sft-v1-128k**                  | Qwen 8B 基础版本             | 可能是 fine-tuned（SFT）模型           |
| **qwen3-8b-sft-mainline0904**                        | 主线训练版                   | 常用于内部评估                         |
| **qwen3-8b-sft-mainline0904-ar-mid-train**           | AR（Agent Router）中期训练版 | 加入 agent 数据训练                    |
| **eval-server-qwen3-8b-sft-0923-agentrouter-stage1** | 阶段性 router 实验模型       | 参与评测流程                           |
| **qwen8b-sft-0904baseline-128k-think**               | “带 think”版                 | 增强了反思 / chain-of-thought 能力     |
| **qwen8b-sft-0904baseline-128k-wothink**             | “无 think”版                 | 常规指令跟随模型                       |
| **qwen8b-sft-agentrouter-1010-128k**                 | after-SFT 模型               | 训练中含 CC 工具数据（更贴近真实使用） |

---

## 四、最后部分说明

```text
替换加粗的 model 名字来测试不同的模型
```

意味着开发者可以直接修改 `Router.default` 中的模型名来快速切换测试不同版本。

```text
Model Proxy：Claude-Sonnet-4.5 【已有，主要用于防呆】
```

表示当前系统中还配置了一个 Claude-Sonnet 代理模型，用于兜底（防止测试模型出错时无法响应）。

---

## 五、总结

这段配置的作用是：

> 让 **Claude Code Router（ccr）** 能够通过统一接口访问多个自研 / 实验性 Qwen 模型，并通过简单配置切换默认使用模型。

其核心特征包括：

- 多模型统一管理；
- 支持 OpenAI API 兼容格式；
- 通过配置快速切换；
- 结合 Stepcast 提供的内部评测服务；
- “think” 模型具备强化推理能力。

---

是否希望我帮你画一张「Claude Code Router 配置结构图」？可以直观显示 Provider → Transformer → Router → Model 的关系。
