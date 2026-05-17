# 开发指南 · Development

## 前置

- Node.js >= 20（仓库根有 `.nvmrc`）
- pnpm >= 10（也可用 npm）
- 浏览器：Chrome / Edge / Firefox / Safari 最近两个版本

## 安装

```bash
pnpm install
```

`postinstall` 时不会拷贝 Vditor 资源，但 `predev` / `prebuild` 钩子会自动跑 `scripts/copy-vditor-assets.mjs` 把 Vditor 静态资源拷到 `public/vditor/dist/`。

## 常用命令

```bash
pnpm run dev                # Vite dev server，http://localhost:5173
pnpm run build              # 生产构建 + 资源拷贝 + bundle 体积检查
pnpm run preview            # 在 4173 端口预览 dist/
pnpm run typecheck          # TypeScript --noEmit
pnpm run lint               # ESLint
pnpm run format             # Prettier 格式化
pnpm run test               # Vitest 单测
pnpm run test:coverage      # 覆盖率报告
pnpm run test:e2e:install   # 首次安装 Playwright Chromium
pnpm run test:e2e           # Playwright E2E
```

## 代码风格

- TypeScript strict 模式，`noUnusedLocals`, `noImplicitOverride` 全开
- 文件名 kebab-case，类型/接口 PascalCase，函数/变量 camelCase
- ESLint + Prettier 自动格式化；提交前可跑 `pnpm run format && pnpm run lint`

## 调试

### 浏览器日志

应用使用结构化 logger，URL 加 `?debug=1` 可打开 DEBUG 级别。「关于」弹窗可下载会话日志 (JSONL)。

### Vite dev server quirk

Vite 5 dev server 在处理路径含 `.js` 命名目录的请求时（如 `/vditor/dist/js/highlight.js/...`）可能错误返回 SPA fallback。仅影响 dev server；生产 preview 与 nginx 都不受影响。如果在 dev 中遇到 Vditor 高亮加载失败，请用 `pnpm run preview` 验证。

## 添加新功能

1. 先想清楚是否真的需要新增。看一下 [LICENSE](../LICENSE) 上方的 README 已知限制。
2. 沿用现有模块边界：
   - 业务装配 → `src/app.ts`
   - UI 组件 → `src/ui/`
   - 输入/输出 → `src/io/`
   - 横切关注点 → `src/lib/`
3. 写单测（如果是纯逻辑）或扩展 E2E（如果跨模块）
4. `pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run test:e2e` 全绿
5. 更新 CHANGELOG.md

## 添加新依赖

- 必须是社区主流、活跃维护、文档完善的库
- 锁定大版本（不要 `latest`）
- 避免引入对包大小有显著影响的依赖；超出 bundle 预算会让 CI 失败
