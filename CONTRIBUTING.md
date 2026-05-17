# 贡献指南 · Contributing

欢迎参与 markdown-editor 项目。

## 本地开发

```bash
pnpm install
pnpm run dev          # http://localhost:5173
pnpm run typecheck    # TypeScript 类型检查
pnpm run lint         # ESLint
pnpm run test         # 单元测试
pnpm run test:e2e     # Playwright E2E（首次运行需 pnpm run test:e2e:install）
pnpm run build        # 生产构建 + bundle 体积检查
```

## 提交规范

请尽量使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat: ...` 新功能
- `fix: ...` Bug 修复
- `docs: ...` 文档
- `refactor: ...` 重构（不影响外部行为）
- `test: ...` 测试
- `chore: ...` 其他

## PR 流程

1. Fork → 创建分支 → 提交修改
2. 确保 `pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run test:e2e` 全部通过
3. 提交 PR，描述变更动机、影响范围、测试方式
4. CI 通过后等待 review

## 代码风格

- TypeScript strict 模式，避免 `any`
- ESLint + Prettier 自动格式化（`pnpm run format`）
- 用户可见字符串集中在 `src/i18n.ts`（未来扩展点）

## 报告问题

请在 issue 中包含：

- 浏览器与版本
- 复现步骤
- 期望行为 vs 实际行为
- 截图或日志（关于面板可下载会话日志）

## License

通过提交贡献，你同意你的代码以 [MIT License](LICENSE) 发布。
