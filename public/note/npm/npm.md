# 修改 npm 包

- npm patch
- npm package

# npm 私服

非常棒 👍，你提到的 **npm 私服（Private npm Registry）** 是前端工程化中非常常见的基础设施，用来 **存储、管理、发布公司或团队内部的 npm 包**。

下面我们来系统地讲一下：

---

## 🧩 一、什么是 npm 私服

**npm 私服（Private npm Registry）** 本质上就是一个你自己部署的 **npm 仓库服务**，
用来替代或代理官方的 [https://registry.npmjs.org](https://registry.npmjs.org)。

它的作用包括：

- ✅ **缓存 npm 官方包**，加快安装速度；
- ✅ **托管私有包**（不发布到公网）；
- ✅ **控制发布权限与访问权限**；
- ✅ **内网可用**（企业内部环境）；
- ✅ **统一依赖源**，保证构建稳定。

---

## 🏗️ 二、常见实现方案

| 方案                                   | 特点               | 是否开源         | 优点                               | 缺点               |
| -------------------------------------- | ------------------ | ---------------- | ---------------------------------- | ------------------ |
| **Verdaccio**                          | 轻量、Node.js 实现 | ✅ 开源          | 部署简单、社区活跃                 | 不适合超大规模     |
| **Nexus Repository Manager**           | 专业企业级方案     | ✅ 免费版/付费版 | 支持 npm、maven、docker 等多种格式 | 较重、Java 环境    |
| **JFrog Artifactory**                  | 商业级仓库         | ✅ 免费版/付费版 | 功能强大、支持多语言包管理         | 资源占用大         |
| **AWS CodeArtifact / GitHub Packages** | 云托管私服         | ❌ 商业服务      | 无需运维、云集成方便               | 成本高、访问需配置 |
| **npm Enterprise**                     | 官方企业版         | ❌ 付费          | 官方维护、安全合规                 | 价格高昂           |

> 🧠 **Verdaccio** 是前端团队最常用的自建私服方案。

---

## ⚙️ 三、Verdaccio 私服搭建流程（推荐）

### 1️⃣ 安装 Verdaccio

```bash
npm install -g verdaccio
```

### 2️⃣ 启动服务

```bash
verdaccio
```

默认会在本地启动 `http://localhost:4873`

### 3️⃣ 配置 npm 使用私服

```bash
npm set registry http://localhost:4873/
```

验证：

```bash
npm whoami
```

---

### 4️⃣ 登录私服

```bash
npm adduser --registry http://localhost:4873/
```

输入用户名 / 密码 / 邮箱后即可登录。

---

### 5️⃣ 发布私有包

假设你在项目目录中有 `package.json`：

```bash
npm publish --registry http://localhost:4873/
```

发布后可通过：

```bash
npm install my-private-package --registry http://localhost:4873/
```

来安装。

---

### 6️⃣ 配置代理上游源（缓存 npm 官方包）

Verdaccio 的配置文件在：

```bash
~/.config/verdaccio/config.yaml
```

修改部分如下：

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  "@*/*":
    access: $all
    publish: $authenticated
    proxy: npmjs
  "**":
    access: $all
    publish: $authenticated
    proxy: npmjs
```

> 这样你的私服既能托管私有包，又能代理 npm 官方源。

---

## 🧠 四、企业常见私服架构

```
┌────────────────────┐
│  官方 npm 源       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Verdaccio / Nexus  │ ← 内部私有包
│ (缓存 + 私包管理)   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 开发者 / CI 构建机 │ → npm install / npm publish
└────────────────────┘
```

---

## 🔐 五、安全与权限控制

Verdaccio 支持：

- 用户登录认证（支持 `htpasswd`、LDAP、GitHub OAuth）；
- 按包名或 scope 限定访问权限；
- 可配置 read-only 用户；
- 可通过反向代理（如 Nginx）加 HTTPS。

例如：

```yaml
packages:
  "@company/*":
    access: $authenticated
    publish: admin
  "private-lib":
    access: user1 user2
    publish: admin
```

---

## 🚀 六、优化与实践建议

| 方向              | 建议                                            |
| ----------------- | ----------------------------------------------- |
| 🔁 CI/CD 集成     | 在流水线中配置私服源                            |
| 🧩 Scope 统一管理 | 公司私包统一使用 `@company/` 前缀               |
| ⚡ 缓存策略       | 开启上游 npm 缓存以加速安装                     |
| 🔒 安全           | 只开放内部访问，外部访问需 VPN 或认证           |
| 🧰 包清理         | 定期清理旧包版本，防止仓库膨胀                  |
| ☁️ 云部署         | 可部署在公司云服务器、GitHub Actions、自托管 CI |

---

## 📦 七、实际开发中的使用方式示例

### `.npmrc` 文件（项目级）

```bash
registry=http://npm.mycompany.com/
always-auth=true
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

### 在 CI 环境中

```bash
npm config set registry http://npm.mycompany.com/
npm ci
```

---

## ✅ 总结

| 项目                 | 推荐方案                              |
| -------------------- | ------------------------------------- |
| 小型团队、自建方便   | 🟢 Verdaccio                          |
| 大型企业、多语言支持 | 🟣 Nexus / Artifactory                |
| 无运维需求、云环境   | ☁️ AWS CodeArtifact / GitHub Packages |

---

如果你愿意，我可以帮你写一个：

> 🚀 一键启动的 Verdaccio 私服 Docker Compose 配置
> 包含权限控制、上游 npm 缓存、内网可访问的完整方案。

要我帮你生成这个示例吗？
