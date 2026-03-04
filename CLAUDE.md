# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

OceanPress 是一款从思源笔记本生成静态站点的工具，采用 monorepo 架构（pnpm workspaces）。项目使用 TypeScript + Vue3 + Effect-TS 构建，核心功能是通过插件化的架构将思源笔记内容渲染为静态 HTML 站点。

## 常用命令

### 根目录命令
```bash
# 构建 RPC 库
pnpm rpc_build

# 构建服务器
pnpm server_build

# 构建前端应用
pnpm frontend_build
```

### Frontend ：是一款从思源笔记本生成静态站点的工具
```bash
# 类型检查
pnpm tsc

# 开发模式运行 CLI
tsx ./src/cli.ts

# 构建静态应用
pnpm build

# 构建 CLI 工具
pnpm build_cli

# 构建 Web 应用库
pnpm build_lib

# 本地测试构建
pnpm cli build --config "./store/configs" --output "./dist_output"
```

### Server (apps/server) 开发
```bash
# 开发模式
pnpm dev

# 构建
pnpm build
```

### RPC (apps/rpc) 开发
```bash
# 开发模式
pnpm dev

# 构建
pnpm build
```

## 核心架构

### 1. Monorepo 结构
- **apps/frontend** - 核心 CLI 工具和前端应用
- **apps/server** - 部署服务器（基于 Fastify）
- **apps/rpc** - 类型安全的 RPC 通信库

### 2. Frontend 架构

#### Effect-TS 依赖注入系统
项目使用 Effect 的 Context 系统进行依赖注入：

- **EffectRender** - 渲染相关 API（获取节点、文档路径等）
- **EffectLogDep** - 日志和进度输出
- **EffectConfigDep** - 配置依赖
- **EffectLocalStorageDep** - 本地存储

#### 核心渲染流程
1. **build()** ([core/build.ts](apps/frontend/src/core/build.ts)) - 主构建函数，处理文档树、资源文件、增量编译
2. **renderHTML()** ([core/render.ts](apps/frontend/src/core/render.ts)) - 将 S_Node 渲染为 HTML
3. **OceanPress** ([core/ocean_press.ts](apps/frontend/src/core/ocean_press.ts)) - 核心类，管理插件和构建流程

#### 插件系统
使用自定义的洋葱中间件机制（[core/plugin.ts](apps/frontend/src/core/plugin.ts)）：
- 插件可以拦截和修改 `funMap` 中的任何函数
- 内置插件：Meilisearch、S3 上传、OceanPressServer 部署、MarkdownMirror
- 插件通过 `PluginCenter` 注册，按洋葱模型执行

#### MarkdownMirror 插件
自动将思源笔记导出为 Markdown 格式，便于与 NotebookLM 等工具集成。

**核心功能：**
- 自动将 HTML 文档转换为 Markdown 格式
- 自动删除生成的 HTML 文件，仅保留 Markdown
- 智能转换内部链接（`.html` → `.md` + 标题锚点）
- 移除思源模板生成的多余内容（版权信息、SiYuan 相关链接等）
- 优化代码块格式和空白字符

**配置示例：**
```json
{
  "markdownMirror": {
    "enable": true,
    "outputDir": "/path/to/output",
    "includeAssets": false,
    "watchMode": false,
    "watchInterval": 60000
  }
}
```

**配置选项：**
- `enable`: 启用 Markdown 镜像导出
- `outputDir`: Markdown 文件输出目录（与构建输出目录相同）
- `includeAssets`: 是否同步资源文件（图片、附件等）
- `watchMode`: 是否启用监听模式，自动同步更新
- `watchInterval`: 监听模式下的同步间隔（毫秒）

#### 思源 API 集成
- [core/siyuan_api.ts](apps/frontend/src/core/siyuan_api.ts) - 封装思源 API 调用
- [core/siyuan_type.ts](apps/frontend/src/core/siyuan_type.ts) - 思源数据类型定义
- [core/cache.ts](apps/frontend/src/core/cache.ts) - 缓存层，优化 API 调用

#### 配置系统
- [core/config.ts](apps/frontend/src/core/config.ts) - 使用 Vue reactive 管理配置
- 支持增量编译配置 `enableIncrementalCompilation`
- 支持多种部署配置（S3、OceanPressServer、Meilisearch）

### 3. Server 架构
- 基于 **Fastify** 构建
- 使用 **oceanpress-rpc** 实现 RPC 通信
- 支持静态文件服务和部署请求处理
- 通过 `.env` 文件配置 API_KEY

### 4. RPC 库
- 提供类型安全的 RPC 通信
- 支持前后端一致的类型定义
- 使用 SuperJSON 进行序列化

## 关键技术栈

### Frontend
- **Vue 3** - UI 框架
- **Effect-TS** - 函数式效果系统
- **Hono** - Web 服务器（开发模式）
- **Commander.js** - CLI 框架
- **Vite** - 构建工具
- **tsup** - CLI 打包工具

### Server
- **Fastify** - Web 框架
- **oceanpress-rpc** - RPC 通信
- **dotenv** - 环境变量管理

## 开发注意事项

### 类型检查
在提交代码前运行 `pnpm tsc` 确保类型正确。

### Effect-TS 模式
- 使用 `Effect.gen(function*(){...})` 编写异步逻辑
- 通过 `yield*` 获取依赖：`const dep = yield* EffectRender`
- 使用 `Effect.runPromise()` 运行 Effect

### 插件开发
插件需要实现对应的中间件函数签名，接收 `(ctx, next)` 参数：
```typescript
const myPlugin = {
  build: async (ctx, next) => {
    // 前置处理
    const result = await next(ctx)
    // 后置处理
    return result
  }
}
```

### 配置文件
- 配置使用 Vue reactive，响应式更新
- 增量编译通过 `__skipBuilds__` 跟踪变化
- 版本不匹配时会忽略增量编译配置进行全量编译

### 性能优化
- 渲染并发数设置为 6 避免栈切换问题
- 支持增量编译跳过未变化内容
- 使用缓存层减少思源 API 调用

## 部署流程

### 标准部署流程
1. **构建** - `oceanpress build` 生成静态文件
2. **部署到 S3** - 配置 `s3.enable` 直接上传
3. **部署到 OceanPressServer** - 配置 `oceanPressServer.enable` 上传 zip
4. **CLI 部署** - 使用 `oceanpress deploy` 命令手动部署

### Markdown 镜像导出
用于与 NotebookLM 等工具集成，自动将思源笔记导出为 Markdown 格式：

1. **配置插件** - 在配置文件中启用 `markdownMirror.enable`
2. **运行构建** - 执行 `oceanpress build` 自动生成 Markdown 文件
3. **导入目标工具** - 将输出目录的 Markdown 文件导入 NotebookLM

**优势：**
- 无需手动导出，构建自动同步
- 自动转换内部链接格式
- 清理冗余模板内容
- 保持与思源笔记同步更新
