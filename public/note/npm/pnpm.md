# pnpm

`pnpm` 是一种 **高性能、节省磁盘空间的包管理工具**，是 `npm` 和 `yarn` 的替代品，尤其在大型项目或 monorepo（多包仓库）中非常受欢迎。它的核心优势在于 **“硬链接 + 内容寻址存储”** 的机制，能大幅节约空间并提升安装速度。

---

## 一、pnpm 的核心特点

### 1. **内容寻址存储（Content-Addressable Storage）**

- 当你使用 `pnpm install` 安装依赖时，依赖包不会直接复制到 `node_modules`。
- 它会把每个包的内容放入全局的 **pnpm store**（如 `~/.pnpm-store`）中。
- 之后不同项目之间共享相同版本的包，通过硬链接（hard link）指向全局缓存，而不是复制文件。

📦 **效果：**

- 节省磁盘空间（数 GB 级别）
- 安装速度极快（无需重复下载）
- 多项目共享缓存

---

### 2. **严格的 node_modules 结构**

`pnpm` 不会像 `npm` 一样将所有依赖“扁平化”安装，而是：

- 为每个依赖维护一个独立的目录结构；
- 通过 `node_modules/.pnpm` 下的符号链接实现模块解析。

📌 **好处：**

- 能更早发现依赖未声明的问题（防止“幽灵依赖”）。
- 模拟更接近 Node.js 的真实模块解析机制。

---

### 3. **安装速度快**

- 同版本依赖包直接从全局 store 链接；
- 支持并发安装；
- 对 lockfile 的解析和 diff 逻辑更高效；
- 内置缓存与增量安装机制。

---

### 4. **完美支持 Monorepo**

`pnpm` 内置对 Monorepo 的一等支持（无需 Lerna）：

🧩 通过 `pnpm-workspace.yaml`：

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

👉 可统一管理多个子包，支持：

- 依赖自动联动（workspace 协议）；
- 版本同步；
- 本地依赖快速软链接；
- 命令批量执行（`pnpm -r build`）。

---

### 5. **与 npm/yarn 兼容**

- `package.json`、`package-lock.json`、`yarn.lock` 都可直接迁移；
- 命令基本一致：

  ```bash
  npm install  →  pnpm install
  npm run dev  →  pnpm dev
  ```

---

## 二、pnpm 的常用命令

| 命令                | 说明                         |
| ------------------- | ---------------------------- |
| `pnpm install`      | 安装依赖                     |
| `pnpm add xxx`      | 添加依赖                     |
| `pnpm remove xxx`   | 删除依赖                     |
| `pnpm update`       | 更新依赖                     |
| `pnpm exec <cmd>`   | 在依赖中执行命令（类似 npx） |
| `pnpm -r run build` | 在所有子包中运行 build       |
| `pnpm store path`   | 查看全局缓存路径             |
| `pnpm prune`        | 清理无用缓存                 |

---

## 三、与 npm / yarn 对比

| 特性              | npm              | yarn            | **pnpm**              |
| ----------------- | ---------------- | --------------- | --------------------- |
| 磁盘占用          | 高               | 中              | **低（共享缓存）**    |
| 安装速度          | 慢               | 中              | **快**                |
| Monorepo 支持     | 手动配置         | Yarn Workspaces | **内置 Workspaces**   |
| 幽灵依赖问题      | 存在             | 存在            | **无**                |
| 包缓存            | 全局缓存但会复制 | 有缓存          | **内容寻址 + 硬链接** |
| node_modules 结构 | 扁平化           | 扁平化          | **严格隔离**          |

---

## 四、适用场景

✅ **推荐使用 pnpm 的情况：**

- 大型项目或 Monorepo 工程；
- 多人协作项目（一致性高）；
- 希望提升安装速度和节省磁盘；
- 需要更严格依赖隔离的环境。

⚠️ **不建议使用的情况：**

- 旧系统或 CI 环境中对符号链接支持不佳；
- 必须使用特定 npm 特性（极少数情况）。

---

## 总结

| 优点                       | 缺点                         |
| -------------------------- | ---------------------------- |
| 快速安装、节省磁盘         | 某些工具不完全兼容           |
| 严格依赖管理、防止幽灵依赖 | 对新手稍有学习曲线           |
| 内置 Monorepo 支持         | Windows 下符号链接兼容性略差 |
| 与 npm/yarn 高度兼容       | ——                           |

---

是否希望我帮你画一个对比图表（npm/yarn/pnpm 的结构和安装机制差异）？那样能更直观地理解它的优势。

# monorepo

非常好的问题 👍，Monorepo 是 pnpm 的一大强项。
pnpm 内置对 Monorepo 的一等支持，不需要额外的工具（比如 Lerna 或 Nx）就能高效管理多个包。

下面我们系统地看一下 **pnpm 是如何处理 monorepo 的** 👇

---

## 一、什么是 Monorepo？

**Monorepo（单一仓库多包架构）**：
是指将多个相互关联的项目（包）放在同一个 Git 仓库中集中管理。

📦 举个例子：

```
my-project/
│
├─ apps/
│   ├─ web/         # 前端应用
│   └─ admin/       # 管理后台
│
├─ packages/
│   ├─ ui/          # 通用组件库
│   └─ utils/       # 工具函数库
│
└─ pnpm-workspace.yaml
```

这些包之间可能互相依赖（比如 web 依赖 ui），pnpm 能智能地处理这些依赖关系。

---

## 二、pnpm 的 Monorepo 核心文件：`pnpm-workspace.yaml`

在项目根目录创建：

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

表示：

- `apps` 和 `packages` 下的所有子文件夹都是子包；
- pnpm 会自动扫描这些目录，将它们视为一个工作区（workspace）。

---

## 三、子包结构（例如）

`packages/utils/package.json`：

```json
{
  "name": "@my/utils",
  "version": "1.0.0",
  "main": "index.js"
}
```

`apps/web/package.json`：

```json
{
  "name": "@my/web",
  "version": "1.0.0",
  "dependencies": {
    "@my/utils": "workspace:*"
  }
}
```

### 👉 特点

- 使用 `"workspace:*"` 表示依赖同一 monorepo 内的包；
- pnpm 会自动创建 **符号链接（symlink）**，让 `web` 使用本地的 `utils`；
- 无需手动构建或发布到 npm。

---

## 四、pnpm 在 Monorepo 中的依赖处理逻辑

1. **安装依赖时 (`pnpm install`)：**

   - pnpm 会识别所有工作区包；
   - 对内部依赖（workspace 内的包）：

     - 自动创建符号链接；
     - 保证使用最新源码；

   - 对外部依赖（npm 上的包）：

     - 安装在全局 store 中；
     - 通过硬链接共享，避免重复安装。

2. **依赖版本对齐：**

   - 可通过 `workspace:` 前缀指定依赖本地包；
   - 可通过 `pnpm recursive`（`pnpm -r`）批量操作所有包；
   - 支持 `pnpm overrides` 做版本统一。

---

## 五、常用命令

| 命令                                           | 作用                                      |
| ---------------------------------------------- | ----------------------------------------- |
| `pnpm install`                                 | 安装所有包的依赖                          |
| `pnpm -r run build`                            | 在所有子包中运行 `build` 命令（递归执行） |
| `pnpm --filter @my/web run dev`                | 只在 `@my/web` 子包中执行命令             |
| `pnpm add lodash --filter @my/utils`           | 只给 `@my/utils` 添加依赖                 |
| `pnpm link --global` / `pnpm link --workspace` | 建立本地包间依赖链接                      |
| `pnpm publish -r`                              | 递归发布所有子包（带版本管理）            |

---

## 六、pnpm 的 Workspace 特性

### ✅ 1. 自动本地链接

本地包引用不会重复下载，而是直接符号链接：

```
apps/web/node_modules/@my/utils -> ../../packages/utils
```

开发体验流畅，无需构建即可热更新。

---

### ✅ 2. 命令可递归执行

```bash
pnpm -r test
```

会自动在每个子包中运行 `test`。

也可带过滤条件：

```bash
pnpm -r --filter @my/utils test
```

---

### ✅ 3. 统一管理依赖版本

根目录可以集中声明 devDependencies（例如 eslint、typescript 等），子包自动继承。

`pnpm install` 会自动生成单一的锁文件 `pnpm-lock.yaml`，确保整个 monorepo 的依赖一致性。

---

### ✅ 4. workspace 协议（workspace:\*）

通过 `"workspace:*"` 指定内部依赖版本，可使用：

- `workspace:*` — 始终使用最新版本；
- `workspace:^` / `workspace~` — 保留 semver 规则；
- 明确版本号（如 `"workspace:1.2.3"`）。

---

## 七、与其他 Monorepo 工具对比

| 特性               | pnpm    | yarn berry | lerna                 |
| ------------------ | ------- | ---------- | --------------------- |
| 内置 Monorepo 支持 | ✅      | ✅         | ❌（需结合 npm/yarn） |
| 本地包链接         | ✅ 自动 | ✅ 自动    | 需配置                |
| 硬链接节省磁盘     | ✅      | ❌         | ❌                    |
| 命令递归执行       | ✅ 内置 | ✅         | 需额外命令            |
| 速度               | 🚀 快   | 中等       | 慢                    |
| 复杂度             | 低      | 中等       | 高                    |

---

## 八、典型工作流示例

```bash
pnpm install         # 安装全部依赖
pnpm dev --filter @my/web  # 启动 web 项目
pnpm build -r        # 构建所有子包
pnpm test -r         # 递归运行测试
pnpm publish -r      # 发布所有包
```

---

## 九、总结

| 优势                  | 说明                        |
| --------------------- | --------------------------- |
| 🚀 性能极高           | 硬链接 + 全局缓存，安装超快 |
| 📦 内置 Monorepo 支持 | 无需额外工具                |
| 🧩 严格依赖管理       | 防止幽灵依赖                |
| 🔗 本地包自动链接     | 即改即生效                  |
| ⚙️ 命令灵活           | 支持递归与过滤执行          |
| 📁 单一锁文件         | 版本一致性更好              |

---

是否希望我帮你画一个 **pnpm monorepo 架构图**（展示工作区结构、本地链接、依赖缓存流程）？
这个图能更直观地理解它在底层是怎么组织包和依赖的。

# monorepo 发布

非常好的问题 👏
Monorepo（单仓多包）项目的**发布（Publish）**确实比单包项目要复杂得多，因为涉及版本管理、依赖同步、构建顺序、tag 策略等多个环节。

下面我们系统地讲一下 **Monorepo 发布的要点与常见方案**👇

---

## 🧭 一、Monorepo 发布的核心挑战

一个 Monorepo 通常包含多个互相依赖的包：

```
my-project/
├─ packages/
│   ├─ core/      # 核心库
│   ├─ ui/        # UI 组件库，依赖 core
│   └─ utils/     # 工具库
```

发布时需要考虑：

1. **版本同步**：多个包是独立版本，还是一起升版本？
2. **依赖更新**：内部依赖（如 `ui` 依赖 `core`）需要自动更新版本号；
3. **构建顺序**：发布前需保证依赖包先构建；
4. **变更检测**：只发布有改动的包；
5. **发布流程自动化**：自动修改 `package.json`、打 tag、发布到 npm。

---

## 🧱 二、pnpm 对 Monorepo 发布的支持

`pnpm` 内置命令：

```bash
pnpm publish -r
```

- `-r`（recursive）表示递归发布所有子包；
- pnpm 会检测每个包的 `package.json`；
- 自动在有 `private: false` 的包上执行发布。

### 示例：

```bash
pnpm publish -r --access public --filter './packages/*'
```

> 会依次发布每个非私有子包到 npm。

---

## ⚙️ 三、版本管理策略

### **1️⃣ 独立版本模式（Independent Versioning）**

每个包维护自己的版本号：

```
@my/core@1.0.1
@my/ui@2.3.0
@my/utils@0.5.4
```

✅ 优点：

- 适合独立演进的模块；
- 更新粒度更细。

❌ 缺点：

- 管理复杂；
- 内部依赖版本容易错位。

📦 pnpm 默认支持这种模式。

---

### **2️⃣ 统一版本模式（Fixed/Locked Versioning）**

所有包共享一个版本号：

```
@my/core@1.2.0
@my/ui@1.2.0
@my/utils@1.2.0
```

✅ 优点：

- 管理简单；
- 一次发版更新所有包；
- 适合 tightly coupled 的系统（如组件库）。

❌ 缺点：

- 无关包也会随版本更新。

🧰 常结合工具：

- `changesets`（推荐）
- `lerna version --conventional-commits`

---

## 🧩 四、发布前的构建与依赖处理

### 1. **构建顺序**

- 先构建被依赖的包；
- 再构建依赖方。

pnpm 自动识别依赖关系：

```bash
pnpm -r run build --filter '!@my/utils'
```

或用：

```bash
pnpm -r --sort run build
```

`--sort` 会根据依赖拓扑排序。

---

### 2. **内部依赖版本替换**

假设：

```json
{
  "dependencies": {
    "@my/core": "workspace:*"
  }
}
```

在发布前需要替换成真实版本号：

```json
"@my/core": "^1.2.3"
```

`pnpm publish` 会自动完成这一步。
如果你用 `changesets` 或 `lerna`，它们也会处理。

---

## 🚀 五、推荐发布流程（基于 pnpm + changesets）

### 1️⃣ 安装 changesets

```bash
pnpm add -Dw @changesets/cli
npx changeset init
```

生成 `.changeset` 目录。

---

### 2️⃣ 在每次改动后创建变更说明

```bash
pnpm changeset
```

- 选择要更新的包；
- 指定版本类型（patch / minor / major）；
- 会生成一个 Markdown 文件记录变更。

---

### 3️⃣ 版本升级

```bash
pnpm changeset version
```

- 自动更新每个包的版本；
- 同步内部依赖版本；
- 更新 changelog。

---

### 4️⃣ 构建并发布

```bash
pnpm -r build
pnpm changeset publish
```

`changeset publish` 会：

- 按变更的包递归发布；
- 替换 `workspace:*`；
- 调用 `pnpm publish`；
- 打 Git tag。

---

## 🧱 六、CI/CD 自动化发布

在 CI（如 GitHub Actions）中，可以：

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - run: pnpm install
      - run: pnpm build
      - run: pnpm changeset version
      - run: pnpm changeset publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

这样就能做到：

- 每次 push 自动检测变更；
- 自动生成版本；
- 自动发包到 npm。

---

## 🔒 七、常见注意事项

| 项             | 建议                                 |
| -------------- | ------------------------------------ |
| **private 包** | 设置 `"private": true"` 防止误发 npm |
| **内部包依赖** | 使用 `"workspace:*"` 管理            |
| **构建产物**   | 保证 `main`/`module` 指向正确路径    |
| **发布前测试** | 可用 `pnpm pack` 本地测试 tarball    |
| **权限**       | npm 发包需设置 `access: public`      |
| **tag 策略**   | 自动打 tag（如 `v1.2.3`）便于追踪    |

---

## ✅ 八、总结

| 目标           | 推荐做法                        |
| -------------- | ------------------------------- |
| 多包版本管理   | 使用 Changesets                 |
| 发布流程自动化 | 配合 CI/CD（GitHub Actions）    |
| 构建顺序       | 使用 `pnpm -r --sort run build` |
| 内部依赖同步   | 使用 `workspace:*`              |
| 安全控制       | 设置 private 防止误发           |

---

如果你希望，我可以帮你写一个完整的
🧩 **「pnpm + changesets + GitHub Actions 的自动发布脚本模板」**，
能让你的 monorepo 一键自动检测变更、打版本、构建并发 npm。
要我帮你生成吗？
