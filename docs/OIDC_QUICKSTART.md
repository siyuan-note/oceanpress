# npm OIDC 发布快速配置

## 一分钟配置指南

### 前置条件
- npm 组织账号（[创建组织](https://www.npmjs.com/org)）
- GitHub 仓库管理员权限

### 配置步骤

#### 1. 在 npm 上配置 OIDC

1. 访问：https://www.npmjs.com/org/`<your-org>`/settings/access
2. 找到 "GitHub Actions OIDC" 部分
3. 点击 "Add GitHub organization"
4. 输入你的 GitHub 组织或用户名
5. 选择要授权的仓库（oceanpress）
6. 保存配置

#### 2. （可选）使用组织作用域包名

在 `apps/frontend/package.json` 中更新：

```json
{
  "name": "@your-org/oceanpress",
  "publishConfig": {
    "access": "public"
  }
}
```

#### 3. 发布

```bash
# 更新版本
npm version patch

# 创建标签并推送
git tag v1.0.13
git push origin v1.0.13
```

GitHub Actions 会自动通过 OIDC 发布到 npm！

### 验证

- 检查 GitHub Actions 运行状态
- 访问 npm 查看已发布的包
- 包会带有 provenance 徽章（更安全）

### 详细文档

查看 [NPM_PUBLISH_GUIDE.md](./NPM_PUBLISH_GUIDE.md) 了解更多详情。
