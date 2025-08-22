# OceanPress

OceanPress 是一款从思源笔记本生成静态站点的工具。

## 安装

从 npm 全局安装：

```bash
npm install -g oceanpress
```

## 快速开始

安装后，您可以直接使用 `oceanpress` 命令：

```bash
# 查看帮助
oceanpress --help

# 构建静态站点
oceanpress build -c ./config.json -o ./dist

# 启动开发服务器
oceanpress server -c ./config.json -p 3000

# 部署站点
oceanpress deploy -c ./config.json -h https://api.example.com -k your-api-key
```

## 项目结构

OceanPress 是一个 monorepo 项目，包含以下主要组件：

- **apps/frontend** - 核心库，包含前端应用和命令行程序
- **apps/oceanpress-server** - 服务器端应用
- **apps/oceanpress-rpc** - RPC 通信库

## 详细文档

- [Frontend 应用文档](./apps/frontend/README.md) - 详细的 CLI 使用说明和配置指南
- [服务器文档](./apps/oceanpress-server/README.md) - 服务器端配置和部署说明
- [RPC 库文档](./apps/oceanpress-rpc/README.md) - 通信接口说明

## 许可证

MIT