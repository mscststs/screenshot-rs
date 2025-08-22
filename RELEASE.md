# Release Guide

## 自动发布流程

本项目使用 GitHub Actions 自动构建和发布到 npm。当推送一个版本标签时，会自动触发发布流程。

### 发布步骤

1. **更新版本号并发布**：

   ```bash
   # 发布补丁版本 (0.1.0 -> 0.1.1)
   npm run release:patch

   # 发布次要版本 (0.1.0 -> 0.2.0)
   npm run release:minor

   # 发布主要版本 (0.1.0 -> 1.0.0)
   npm run release:major
   ```

2. **手动发布**（如果需要）：

   ```bash
   # 构建所有平台
   npm run build:all

   # 发布到 npm
   npm publish
   ```

### 支持的平台

- **macOS**: x64, arm64
- **Windows**: x64
- **Linux**: x64, arm64

### GitHub Actions 工作流

- **Test**: 在每次推送和 PR 时运行测试
- **Release**: 在推送版本标签时自动构建和发布

### 环境变量

需要在 GitHub 仓库设置中添加以下 secrets：

- `NPM_TOKEN`: npm 发布令牌

### 发布产物

每次发布会包含：

- 所有平台的预编译 `.node` 文件
- TypeScript 类型定义
- JavaScript 入口文件
- README 和许可证文件

### 故障排除

如果发布失败：

1. 检查 GitHub Actions 日志
2. 确保 `NPM_TOKEN` 已正确设置
3. 验证版本号格式正确
4. 检查 npm 包名是否可用
