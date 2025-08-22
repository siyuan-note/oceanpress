OceanPress 完整发布流程

请按以下步骤执行 OceanPress 项目的完整发布流程：

## 执行步骤

### 1. 更新依赖
- 运行 `pnpm update --latest` 更新所有依赖到最新版本
- 等待更新完成，记录更新的包列表

### 2. 检查程序问题
- 运行 `pnpm tsc` 检查 TypeScript 类型错误
- 运行 `pnpm build_cli` 重新编译 CLI 工具
- 运行 `node dist-cli/cli.js --help` 测试编译后的 CLI 工具
- 如果有任何错误，请先修复再继续

### 3. 更新版本号
- 运行 `npm version patch` 更新 patch 版本号
- 记录新的版本号

### 4. Git commit并推送到远程
- 查看当前状态：`git status`
- 查看变更内容：`git diff`
- 添加变更文件：`git add package.json pnpm-lock.yaml`
- 提交变更：`git commit -m "更新依赖版本至 [新版本号]"`
- 确认提交成功

### 5. 添加 Git tag并推送到远程
- 获取当前版本号：`node -p "require('./package.json').version"`
- 创建 tag：`git tag v[版本号]`
- 确认 tag 创建成功

### 6. 发布到 npm
- 运行 `npm publish` 发布包到 npm
- 等待发布完成
- 记录发布结果

## 质量检查清单

在发布前请确认：
- [ ] 所有依赖更新成功
- [ ] TypeScript 类型检查通过
- [ ] CLI 工具编译成功
- [ ] CLI 功能测试正常
- [ ] 版本号正确更新
- [ ] Git commit 信息规范
- [ ] Git tag 正确创建
- [ ] npm 发布成功

## 错误处理

如果遇到错误：
1. 类型错误：修复 TypeScript 问题后重新检查
2. 编译错误：检查依赖冲突和代码问题
3. Git 错误：确保工作区干净，没有未提交的变更
4. npm 错误：检查网络连接和 npm 登录状态

## 注意事项

- 工作目录干净，没有未提交的变更
- 遵循项目提交信息规范

请按照这个流程执行，并在每个步骤完成后报告结果。