# OceanPress Frontend

This is the core library of OceanPress, including the frontend application and command-line tool.

English | **[简体中文文档](./README.md)**

## CLI Commands

### 1. Build Static Site (build)

Convert SiYuan notebook content to a static website:

```bash
oceanpress build -c <config_path> -o <output_dir> [options]
```

**Options:**
- `-c, --config <string>` - Specify the configuration file location
- `-o, --output <string>` - Specify the output directory location
- `--md` - Automatically enable Markdown mirror export (equivalent to setting markdownMirror.enable = true in config)
- `--watch` - Enable watch mode for automatic rebuilds
- `--watch-interval <number>` - Check interval for watch mode (seconds), default 60 seconds

**Examples:**
```bash
# Basic build
oceanpress build -c ./config.json -o ./dist

# Build with Markdown mirror export
oceanpress build -c ./config.json -o ./dist --md

# Enable watch mode with 30-second interval
oceanpress build -c ./config.json -o ./dist --watch --watch-interval 30
```

### 2. Start Development Server (server)

Run a dynamic proxy server for development and preview:

```bash
oceanpress server -c <config_path>
```

**Options:**
- `-c, --config <string>` - Specify the configuration file location
- `-h, --host <string>` - Web service binding address (default: 127.0.0.1)
- `-p, --port <number>` - Web service binding port (default: 80)
- `--cache <boolean>` - Set to true to enable caching, default false

**Examples:**
```bash
# Use default port
oceanpress server -c ./config.json

# Specify port and host
oceanpress server -c ./config.json -p 3000 -h 0.0.0.0

# Enable caching
oceanpress server -c ./config.json --cache true
```

### 3. Deploy Site (deploy)

Deploy the generated site to a remote server:

```bash
oceanpress deploy -c <config_path> -h <api_url> -k <api_key>
```

**Options:**
- `-c, --config <string>` - Specify the configuration file location
- `-h, --apiBase <string>` - OceanPress server address
- `-k, --apiKey <string>` - OceanPress server API key

**Examples:**
```bash
oceanpress deploy -c ./config.json -h https://api.example.com -k your-api-key
```

## Configuration File

OceanPress uses JSON format configuration files to define site information and build parameters. Configuration files typically include:

- Site name and description
- SiYuan notebook connection configuration
- Theme and style settings
- Plugin configuration

### MarkdownMirror Plugin Configuration

The MarkdownMirror plugin automatically converts generated HTML documents to Markdown format, making it easy to integrate with tools like NotebookLM.

**Configuration Example:**
```json
{
  "markdownMirror": {
    "enable": true,
    "outputDir": "/path/to/output",
    "includeAssets": false
  }
}
```

**Configuration Options:**
- `enable` - Enable Markdown mirror export
- `outputDir` - Markdown file output directory (usually same as build output directory)
- `includeAssets` - Whether to sync asset files (images, attachments, etc.), default false

**Features:**
- Automatically convert HTML documents to Markdown format
- Automatically delete generated HTML files, keeping only Markdown
- Smart internal link conversion (.html → .md + title anchors)
- Remove redundant template content (copyright info, SiYuan links, etc.)
- Optimize code blocks and whitespace

**Usage:**
1. Enable `markdownMirror.enable = true` in configuration file
2. Run `oceanpress build --md` or set directly in configuration
3. Output directory will contain Markdown files, ready to import into NotebookLM

## Tech Stack

- Vue 3
- TypeScript
- Hono
- Effect
- Commander.js

## Development

You can use Claude to execute the `/full-release` command to automatically update dependencies and push to npm.
