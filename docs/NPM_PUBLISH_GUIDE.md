# npm 自动发布配置指南

## 概述

项目已配置 GitHub Actions 自动发布到 npm，当推送以 `v` 开头的 tag 时会自动触发发布流程。

**推荐使用 OIDC 认证方式**，这是比传统 NPM_TOKEN 更安全的认证方案。

## 配置步骤

### 方式一：使用 OIDC 认证（推荐）

OIDC (OpenID Connect) 是 npm 和 GitHub Actions 联合提供的无密码认证方式，更安全且无需管理长期有效的 token。

#### 1. 在 npm 上配置 OIDC

1. **创建或使用 npm 组织**
   - 访问 https://www.npmjs.com/org
   - 创建新组织或使用现有组织（例如 `siyuan-note`）

2. **将包转移到组织**
   - 如果包已经在个人账户下，需要转移到组织
   - 或者在 package.json 中直接使用组织作用域的包名：`@siyuan-note/oceanpress`

3. **配置 GitHub Actions OIDC**
   - 访问 https://www.npmjs.com/org/<your-org>/settings/access
   - 在 "GitHub Actions OIDC" 部分点击 "Add GitHub organization"
   - 输入你的 GitHub 组织/用户名称（例如 `siyuan-note`）
   - 选择要关联的 GitHub 仓库
   - 配置权限和作用域

4. **验证 OIDC 配置**
   - 确保在 npm 组织设置中可以看到已连接的 GitHub 仓库
   - 确保配置了正确的发布权限

#### 2. 更新 package.json（如果使用组织作用域）

如果使用组织作用域包名，更新 `apps/frontend/package.json`：

```json
{
  "name": "@siyuan-note/oceanpress",
  "publishConfig": {
    "access": "public"
  }
}
```

#### 3. 无需配置 NPM_TOKEN

使用 OIDC 时，**不需要**在 GitHub Secrets 中配置 NPM_TOKEN。GitHub Actions 会自动通过 OIDC 获取认证。

### 方式二：使用 NPM_TOKEN（传统方式，不推荐）

### 2. 确保你有 npm 发布权限

确保你的 npm 账号有 `oceanpress` 包的发布权限。如果是第一次发布，需要先在 npm 上注册这个包名。

**注意**：如果使用 OIDC，包名最好是组织作用域的（如 `@siyuan-note/oceanpress`），这样更安全且易于管理。

### 3. 发布新版本

#### 方式一：使用 Git 标签（推荐）

```bash
# 更新版本号
cd apps/frontend
npm version patch  # 或 minor, major
cd ..

# 提交版本更新
git add apps/frontend/package.json
git commit -m "chore: bump version to x.x.x"

# 创建并推送标签
git tag v1.0.13
git push origin v1.0.13

# 或者使用一条命令
git tag -a v1.0.13 -m "Release version 1.0.13"
git push origin v1.0.13
```

#### 方式二：使用 GitHub Release

```bash
# 创建标签
git tag -a v1.0.13 -m "Release version 1.0.13"
git push origin v1.0.13

# 然后在 GitHub 上创建 Release
# GitHub Actions 会自动检测并触发
```

## Workflow 工作流程

当推送 `v*` 标签后，GitHub Actions 会自动执行以下步骤：

1. **检出代码** - 使用 `actions/checkout@v4`
2. **设置 pnpm** - 使用 pnpm 10.6.1
3. **设置 Node.js** - 使用 Node.js 20，启用 pnpm 缓存
4. **安装依赖** - 运行 `pnpm i`
5. **构建项目** - 构建所有工作空间
6. **配置 npm OIDC** - 配置 OIDC 认证（或使用 NPM_TOKEN）
7. **发布到 npm** - 使用 `npm publish --provenance --access public`

### OIDC vs NPM_TOKEN

| 特性 | OIDC | NPM_TOKEN |
|------|------|-----------|
| 安全性 | 高（临时令牌） | 中（长期有效） |
| 配置复杂度 | 中 | 低 |
| 需要组织 | 是（推荐） | 否 |
| 推荐场景 | 生产环境 | 测试/个人项目 |

## 查看发布状态

1. 访问 GitHub 仓库的 "Actions" 标签页
2. 查看最新的 workflow 运行状态
3. 点击具体的 run 查看详细日志

## 版本号规范

遵循语义化版本（Semantic Versioning）：

- **MAJOR**（主版本号）：不兼容的 API 变更
- **MINOR**（次版本号）：向后兼容的功能新增
- **PATCH**（修订号）：向后兼容的问题修正

示例：
```bash
npm version patch   # 1.0.12 → 1.0.13
npm version minor   # 1.0.12 → 1.1.0
npm version major   # 1.0.12 → 2.0.0
```

## 注意事项

1. **标签格式**：必须以 `v` 开头，如 `v1.0.13`
2. **发布权限**：确保 NPM_TOKEN 有 automation 级别的权限
3. **包名冲突**：如果包名已被占用，需要在 package.json 中修改包名
4. **Public 包**：使用 `--access public` 确保包是公开的
5. **Provenance**：使用 `--provenance` 提高包的安全性（推荐）

## 故障排查

### 发布失败

**使用 OIDC 时：**
1. **检查组织配置**：确保 npm 组织中正确配置了 GitHub Actions OIDC
2. **检查仓库权限**：确保 GitHub 仓库已关联到 npm 组织
3. **检查包名**：如果使用组织作用域，确保 package.json 中的包名正确
4. **查看日志**：在 GitHub Actions 中查看详细错误信息

**使用 NPM_TOKEN 时：**
1. **检查 NPM_TOKEN**：确保 token 有效且有权限
2. **检查包名**：确保包名可用或你拥有该包
3. **检查版本号**：确保新版本号大于当前已发布的版本
4. **查看日志**：在 GitHub Actions 中查看详细错误信息

### OIDC 常见错误

1. **"OIDC token not found"**
   - 确保 workflow 中包含 `id-token: write` 权限
   - 确保 npm 组织中正确配置了 GitHub Actions

2. **"Package not found"**
   - 如果是首次发布，需要在 npm 上注册包名
   - 或使用组织作用域包名（自动创建）

3. **"Permission denied"**
   - 检查 npm 组织中的 GitHub Actions 配置
   - 确保仓库有发布权限

### 包未出现在 npm

1. 等待几分钟后刷新页面
2. 访问 https://www.npmjs.com/package/oceanpress
3. 检查是否发布成功

## 相关文件

- **Workflow 配置**：[`.github/workflows/npm-publish.yml`](../.github/workflows/npm-publish.yml)
- **包配置**：[`apps/frontend/package.json`](../apps/frontend/package.json)
- **发布忽略文件**：[`apps/frontend/.npmignore`](../apps/frontend/.npmignore)
