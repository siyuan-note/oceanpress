# OceanPress Frontend

这个是 OceanPress 的核心库，包含了前端应用和命令行程序。

**[English Documentation](./README_EN.md)** | 简体中文

## CLI 命令详解

### 1. 构建静态站点 (build)

将思源笔记本的内容转换为静态网站：

```bash
oceanpress build -c <配置文件路径> -o <输出目录> [选项]
```

**选项：**
- `-c, --config <string>` - 指定配置文件的位置
- `-o, --output <string>` - 指定输出目录位置
- `--md` - 自动启用 Markdown 镜像导出（等同于在配置文件中设置 markdownMirror.enable = true）
- `--watch` - 启用监听模式，自动重新构建
- `--watch-interval <number>` - 监听模式的检查间隔（秒），默认 60 秒

**示例：**
```bash
# 基础构建
oceanpress build -c ./config.json -o ./dist

# 构建并启用 Markdown 镜像导出
oceanpress build -c ./config.json -o ./dist --md

# 启用监听模式，每 30 秒检查一次更新
oceanpress build -c ./config.json -o ./dist --watch --watch-interval 30
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

### MarkdownMirror 插件配置

MarkdownMirror 插件可以自动将生成的 HTML 文档转换为 Markdown 格式，便于与 NotebookLM 等工具集成。

**配置示例：**
```json
{
  "markdownMirror": {
    "enable": true,
    "outputDir": "/path/to/output",
    "includeAssets": false
  }
}
```

**配置选项：**
- `enable` - 是否启用 Markdown 镜像导出
- `outputDir` - Markdown 文件输出目录（通常与构建输出目录相同）
- `includeAssets` - 是否同步资源文件（图片、附件等），默认 false

**功能特性：**
- 自动将 HTML 文档转换为 Markdown 格式
- 自动删除生成的 HTML 文件，仅保留 Markdown
- 智能转换内部链接（.html → .md + 标题锚点）
- 移除思源模板生成的多余内容（版权信息、SiYuan 相关链接等）
- 优化代码块格式和空白字符

**使用方式：**
1. 在配置文件中启用 `markdownMirror.enable = true`
2. 运行 `oceanpress build --md` 或直接在配置中设置
3. 输出目录将生成 Markdown 文件，可直接导入 NotebookLM

## 技术栈

- Vue 3
- TypeScript
- Hono
- Effect
- Commander.js


## 开发相关

可以使用 claude 执行 /full-release 命令自动更新依赖并推送npm