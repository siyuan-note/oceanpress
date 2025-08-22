# OceanPress Frontend

这个是 OceanPress 的核心库，包含了前端应用和命令行程序。

## CLI 命令详解

### 1. 构建静态站点 (build)

将思源笔记本的内容转换为静态网站：

```bash
oceanpress build -c <配置文件路径> -o <输出目录>
```

**选项：**
- `-c, --config <string>` - 指定配置文件的位置
- `-o, --output <string>` - 指定输出目录位置

**示例：**
```bash
oceanpress build -c ./config.json -o ./dist
```

### 2. 启动开发服务器 (server)

运行动态代理服务器用于开发和预览：

```bash
oceanpress server -c <配置文件路径>
```

**选项：**
- `-c, --config <string>` - 指定配置文件的位置
- `-h, --host <string>` - web服务绑定到的地址（默认：127.0.0.1）
- `-p, --port <number>` - web服务绑定到的端口（默认：80）
- `--cache <boolean>` - 配置为 true 时开启缓存，默认为 false 不开启缓存

**示例：**
```bash
# 使用默认端口
oceanpress server -c ./config.json

# 指定端口和主机
oceanpress server -c ./config.json -p 3000 -h 0.0.0.0

# 开启缓存
oceanpress server -c ./config.json --cache true
```

### 3. 部署站点 (deploy)

将生成的站点部署到远程服务器：

```bash
oceanpress deploy -c <配置文件路径> -h <API地址> -k <API密钥>
```

**选项：**
- `-c, --config <string>` - 指定配置文件的位置
- `-h, --apiBase <string>` - OceanPress server 地址
- `-k, --apiKey <string>` - OceanPress server Api 密钥

**示例：**
```bash
oceanpress deploy -c ./config.json -h https://api.example.com -k your-api-key
```

## 配置文件

OceanPress 使用 JSON 格式的配置文件来定义站点的基本信息和构建参数。配置文件通常包含：

- 站点名称和描述
- 思源笔记本的连接配置
- 主题和样式设置
- 插件配置

## 技术栈

- Vue 3
- TypeScript
- Hono
- Effect
- Commander.js
