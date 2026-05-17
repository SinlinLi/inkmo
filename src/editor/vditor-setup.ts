// Vditor instantiation. All Vditor assets are served locally from /vditor/
// (copied by scripts/copy-vditor-assets.mjs) to keep CSP `default-src 'self'` strict.

import Vditor from 'vditor';
import 'vditor/dist/index.css';

import { logger } from '../lib/logger';
import type { EditorMode, Settings } from '../lib/storage';
import { resolveTheme } from './theme';

const log = logger.scope('vditor');

export interface VditorWrapper {
  instance: Vditor;
  getValue(): string;
  setValue(md: string): void;
  getHTML(): string;
  switchMode(mode: EditorMode): void;
  applyTheme(mode: 'light' | 'dark'): void;
  destroy(): void;
}

export interface VditorInitOpts {
  container: HTMLElement;
  initial: string;
  settings: Settings;
  onInput(value: string): void;
  onReady?(): void;
}

export function createVditor(opts: VditorInitOpts): Promise<VditorWrapper> {
  return new Promise((resolve) => {
    const resolvedTheme = resolveTheme(opts.settings.theme);
    const t0 = performance.now();

    // Vditor builds asset URLs as `${cdn}/dist/...`. Resolve relative to the
    // app's BASE_URL so the same build works at any base path (root for nginx,
    // `/inkmo/` for GitHub Pages). BASE_URL always ends in `/`, strip it so
    // Vditor's `${cdn}/dist` interpolation doesn't double-slash.
    const cdnPath = `${import.meta.env.BASE_URL}vditor`.replace(/\/+$/, '');

    const instance = new Vditor(opts.container, {
      mode: opts.settings.editorMode,
      cdn: cdnPath,
      width: '100%',
      height: '100%',
      placeholder: '开始书写… 也可拖放 .md 文件到这里',
      theme: resolvedTheme === 'dark' ? 'dark' : 'classic',
      preview: {
        // Hide Vditor's default preview-pane action buttons (responsive-toggle
        // and "复制到知乎 / 公众号" platform-specific HTML copies). These are
        // Chinese-content-platform helpers we don't need in a generic editor.
        actions: [],
        theme: { current: resolvedTheme === 'dark' ? 'dark' : 'light' },
        hljs: { style: resolvedTheme === 'dark' ? 'github-dark' : 'github', lineNumber: true },
        math: { engine: 'KaTeX' },
        markdown: {
          mark: true,
          footnotes: true,
          autoSpace: true,
          gfmAutoLink: true,
          listStyle: true,
          paragraphBeginningSpace: false,
          fixTermTypo: false,
          sanitize: true, // DOMPurify-like Vditor builtin
        },
      },
      toolbar: [], // hide the built-in toolbar — we render our own
      counter: { enable: true, type: 'text' },
      cache: { enable: false }, // we drive our own draft cache
      input(value: string) {
        opts.onInput(value);
      },
      after() {
        instance.setValue(opts.initial || '');
        log.info('vditor ready', {
          version: (Vditor as unknown as { version?: string }).version,
          mode: opts.settings.editorMode,
          theme: resolvedTheme,
          ms: Math.round(performance.now() - t0),
        });
        opts.onReady?.();
        resolve(wrap(instance));
      },
    });

    function wrap(v: Vditor): VditorWrapper {
      return {
        instance: v,
        getValue: () => v.getValue(),
        setValue: (md: string) => v.setValue(md),
        getHTML: () => v.getHTML(),
        switchMode(mode: EditorMode) {
          // Vditor lacks a single API for runtime mode switch; cleanest path
          // is destroy + recreate, preserving content.
          const value = v.getValue();
          opts.settings = { ...opts.settings, editorMode: mode };
          v.destroy();
          createVditor({
            container: opts.container,
            initial: value,
            settings: opts.settings,
            onInput: opts.onInput,
            onReady: opts.onReady,
          }).then(() => log.info('mode switched', { to: mode }));
        },
        applyTheme(theme: 'light' | 'dark') {
          v.setTheme(
            theme === 'dark' ? 'dark' : 'classic',
            theme,
            theme === 'dark' ? 'github-dark' : 'github',
          );
        },
        destroy() {
          v.destroy();
        },
      };
    }
  });
}

export const WELCOME_DOC = `# 欢迎使用 墨 (Inkmo)

一个中英文友好、支持即时渲染的 Markdown 在线编辑器。**纯前端**，所有内容只保存在你本机的浏览器。

## 主要功能

- 两种编辑模式：即时渲染（IR）与分屏预览（SV），工具栏一键切换
- 打开本地 \`.md\` / \`.markdown\` / \`.txt\` 文件，也支持直接拖放
- 一键下载当前内容为 \`.md\` 文件
- 导出 PDF：走浏览器原生打印对话框，CJK 字体与分页都正确
- 深浅色主题，跟随系统或手动切换
- 草稿自动保存，下次打开恢复
- 键盘快捷键，按 \`Ctrl+/\` 查看完整列表

## 试试看

### 行内样式

支持 **粗体**、*斜体*、~~删除线~~、\`内联代码\` 和 [超链接](https://example.com)。

### 列表

- 项目一
- 项目二
  - 嵌套
- 项目三

1. 有序项目
2. 第二项

### 代码块

\`\`\`typescript
function hello(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### 引用

> "If you cannot measure it, you cannot improve it." — Lord Kelvin

### 表格

| 模式 | 行为 | 适合场景 |
| ---- | ---- | -------- |
| IR | Markdown 标记保留可见，旁边即时渲染样式 | 想随时看到原始语法的写作者 |
| SV | 左编辑右预览，传统分屏 | 喜欢经典模式 / 复杂排版核对 |

---

清空此欢迎文档：\`Alt+N\` 或工具栏「新建」按钮。

---

> 「墨」/ Inkmo · MIT License · 内容只在你本机
`;
