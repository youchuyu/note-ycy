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

# 幻觉文档概览

这是一份“幻觉测评报告（2025-10-10）”的项目说明与实施方案草稿。内容涵盖：评测目标、题集设计、Judge（机评）策略与一致性验证、评测指标体系、发现的问题与优化动作、以及结果分析维度。

---

## 一、当前施工与 Judge 优化进展

- 随机抽取 40 道题，做“人工 vs. 机评”的一致性验证
  - 迭代 Judge 模型选择与 system prompt
  - 达到约 95%一致性（说明机评标准基本可靠）
- 候选 Judge 模型
  - Claude、GPT-5（占位/备选）、DeepSeek 3.1
  - 初步结论：Claude 4.5 作为主 Judge 较稳健
- 分析测评过程与模型行为
  - IAP 服务页面：集中查看问题、GT、模型回答（20 次采样）、判分结果（20 次）
    - https://hallu-eval.iap.platform.shaipower.com/
  - CSV：导出与汇总统计结果

---

## 二、行动项（Actions）

- 优化 eval prompt（出题与作答模板提示）
- 优化 GT（参考答案/判分要点的写法）
- bmk 增删改（优化题库，删除歧义题、补充多轮题、明确字符匹配型题）

备注：文中多处“[图片]”为内部讨论截图，主要记录了问题样例、判分理由与修订建议。

---

## 三、问题反馈与 GT 迭代（按人员评论汇总）

- 来自 @白婧 的要点
  - 判定“是否算幻觉”的标准需更清晰
  - 通过对比 Judge 判错原因与题目 GT 要求来迭代 GT
    - 案例 1：模型已成功拒答，但 GT 要求“必须明确说没有 97 集”，导致判错
      - 优化：将“必须出现某措辞”改为“达到拒答目的的等效表述可接受”
    - 案例 2：GT 允许“部分列举作品”，但 Judge 误以为必须“完整罗列”
      - 优化：在 GT 中明确“无需完整罗列”
- 来自 @王子璇 的要点 -（无具体文字，可能为参与讨论/待补充）
- 来自 @王洪远 的要点
  - 部分题目 GT 过于苛刻，需放宽 Judge prompt，关注“行为是否达标”，少纠缠细节
  - 增加报错处理机制（不只 429；K2 模型环境还会有其他异常）
  - 评估 prompt 过细，建议模糊化行为级别对照
  - 纠错类题目较难，需要重新设计或给更清晰标准
  - 置信度字段经常为 0 或缺失，需检查模板与指令遵循
  - 有些题过于简单、考核点不明确，需调整或删除
  - 某些题应采用“字符级匹配”判分（背诵/复述类）
  - Judge 偶有误判，需要重试机制（retry）
  - 个别题描述不清（如“指定的待翻译区”不明确），需重写说明
  - “必须拒答”的表述过于绝对，可改为“先明确无法回答/信息不足”
  - 需要构造多轮对话题（如两轮：先与材料互动，再问目标问题）

---

## 四、BMK（题库）设计

- 目标：评测不同模型的“抗幻觉能力”
- 三大维度
  - 一致性幻觉：避免“自洽但与事实/原文不符”的编造或错误归因
  - 诚实拒答（IDK）：无法完成任务时能否如实告知“不知道/做不到”
  - 背诵幻觉：能否逐字逐符复现指定文本，不增删、不换序
- 场景与规模
  - 短文场景：45 题
  - 长上下文场景：60 题
  - 短文+无关长前缀干扰：45 题
  - 合计：150 题
- 示例
  - IDK：问不存在的“甄嬛传第 97 集”，应明确“不存在/无法回答”，不能编造
  - 一致性：从新闻稿复述与刘晓庆相关的两则内容，必须与原文对应
  - 背诵：完整逐字复述指定段落或无序字符串，仅允许原样输出

---

## 五、评测方法与指标

- 评估模型范围
  - Claude、Gemini、seed（豆包）、kimi、deepseek、step3v、glm 等系列
- 主要指标
  - pass@k：同题采样 k 次，任意一次通过即算通过（反映“多试上限”）
  - allpass@k：同题 k 次全部通过才算通过（反映稳定性）
  - avg_success@k：k 次尝试的平均成功比例（反映单次平均成功率）
- 侧面指标
  - 输入字符长度：长度 vs 通过率曲线/表
  - 语义置信度（0-1）
    - 通过模板强制模型自报信心，统计对/错样本的分布
    - 统计无法产出/非法值，检验指令遵循与稳健性
  - 开源对照 bmk（侧证相关性）
    - SimpleQA：短事实问答，低幻觉相关性强
    - GPQA：高难理工推理，非专门“幻觉”测评
    - HLE：前沿难度、多模态、抗检索题集

---

## 六、Judge 设置与一致性验证

- Judge 模型
  - 试验表明：Claude 4.5、DeepSeek 3.1 表现较优
  - 最终采用 Claude 4.5 为主 Judge
- 评测方法
  - 全量任务统一 GT 格式，明确列出“要点清单”
  - 所有 Judge 模型共享同一评测 Prompt
  - 背诵类统一用正则/字符匹配判定（避免主观误差）
- 机评一致性分析
  - 用 Kimi-K2 生成回答，由 Claude 4.5 与 DeepSeek 3.1 分别判分
  - 抽样对比人工标注，一致性预计 ≥95%
  - 结论：评测方法具有可用的可靠性
- 后续计划（TBD）
  - 审核评测 trace，修订 bmk GT 至 V4

---

## 七、结果分析维度（报告将展示）

- 思维链开关：Thinking vs. Not Thinking 的整体得分差异
- 任务场景：短文 / 长文 / 长前缀短文 的适配差异
- 幻觉类型：IDK / 一致性 / 背诵 三类任务的得分与错误画像

---

## 八、关键结论与建议

- 结论
  - 95%人工-机评一致性表明 Judge 方案基本可信
  - 过于“绝对化”的 GT 与 Judge Prompt 会误杀应判对的行为
  - 背诵/复述类必须采用字符级判分，避免语义判定带来的误差
- 建议
  - GT 从“唯一措辞要求”转向“行为要点达标”
  - Judge Prompt 淡化细节苛刻度，突出可验证要点
  - 完善错误处理与 retry，覆盖 429 以外的异常
  - 补充多轮对话题、删除考核点不明确的题、重写描述不清的题
  - 在需要时强制模板化产出置信度字段，便于分析校准能力

---

## 术语速览

- GT（Ground Truth）：参考答案/判分标准
- Judge：LLM 作为自动判分器（LLM-as-Judge）
- bmk：benchmark（评测题集）
- pass@k / allpass@k / avg_success@k：核心通过率指标
- IDK：拒答类能力（不知道/无法判断时的诚实表达）
- 长前缀短文：短问题前增加无关长文本作为干扰，考察抗干扰能力

---

## 参考入口

- IAP 服务（题目/GT/多次回答与判分查看）：
  - https://hallu-eval.iap.platform.shaipower.com/

# 输入问题 -> 模型回复

# 文本

# 调用 api 报错

# 修改数据 问题/GT/模型 -> 重新跑

# 导入数据集：长文本太长了，无法通过 excel 上传

# 问题 -> 数据 -> 评测

# 回复数量
