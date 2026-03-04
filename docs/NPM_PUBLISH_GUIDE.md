# npm 自动发布配置指南

## 概述

项目已配置 GitHub Actions 自动发布到 npm，当推送以 `v` 开头的 tag 时会自动触发发布流程。

## 配置步骤

### 1. 配置 NPM_TOKEN

需要在 GitHub 仓库中配置 npm 认证令牌：

1. **创建 npm Access Token**
   - 访问 https://www.npmjs.com/settings/tokens
   - 点击 "Generate New Token" → "Automation"
   - 复制生成的 token（只显示一次）

2. **添加到 GitHub Secrets**
   - 进入 GitHub 仓库设置
   - 点击 "Secrets and variables" → "Actions"
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Secret: 粘贴刚才的 npm token
   - 点击 "Add secret"

### 2. 确保你有 npm 发布权限

确保你的 npm 账号有 `oceanpress` 包的发布权限。如果是第一次发布，需要先在 npm 上注册这个包名。

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
6. **发布到 npm** - 使用 `npm publish --provenance --access public`

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

1. **检查 NPM_TOKEN**：确保 token 有效且有权限
2. **检查包名**：确保包名可用或你拥有该包
3. **检查版本号**：确保新版本号大于当前已发布的版本
4. **查看日志**：在 GitHub Actions 中查看详细错误信息

### 包未出现在 npm

1. 等待几分钟后刷新页面
2. 访问 https://www.npmjs.com/package/oceanpress
3. 检查是否发布成功

## 相关文件

- **Workflow 配置**：[`.github/workflows/npm-publish.yml`](../.github/workflows/npm-publish.yml)
- **包配置**：[`apps/frontend/package.json`](../apps/frontend/package.json)
- **发布忽略文件**：[`apps/frontend/.npmignore`](../apps/frontend/.npmignore)
