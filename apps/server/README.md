# OceanPress server

方便 OceanPress 部署的程序

本身可以作为 http server 来承担访问流量，或者仅仅作为处理部署请求的后端

大致流程：

1. 安装 OceanPress server 程序 : `pnpm i -g oceanpress-server`
2. 配置 apiKey ： 在运行程序的目录中创建文件 .env 并写入配置 `API_KEY=api-key-test` ,请注意不要泄露 apiKey，另外创建复杂度高一些的
3. 运行 OceanPress server 程序 : 命令行执行 `oceanpress_server`
3. OceanPress 中配置 OceanPress server apiBase 和 ApiKey
4. OceanPress 发起部署请求（需要部署的笔记本配置和笔记本静态化内容 zip）
5. 处理部署请求并将 zip 解压部署到本地磁盘
6. 提供对本地磁盘对应目录的 http server

## 配置 .env

```env
# 自定义api鉴权密钥
API_KEY=api-key-test
```

## 技术栈

fastify , nodejs , typescript 使用 pnpm 包管理
