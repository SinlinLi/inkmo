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

    const instance = new Vditor(opts.container, {
      mode: opts.settings.editorMode,
      cdn: '/vditor', // local-served Vditor assets
      width: '100%',
      height: '100%',
      placeholder: '开始书写… 支持拖放 / 粘贴 Markdown 文件',
      theme: resolvedTheme === 'dark' ? 'dark' : 'classic',
      preview: {
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

export const WELCOME_DOC = `# 欢迎使用 Markdown Editor

这是一个 **所见即所得** 的 Markdown 在线编辑器。

## 主要功能

- ✍️ 三种模式：所见即所得 / 即时渲染 / 分屏预览（顶部工具栏一键切换）
- 📂 打开本地 \`.md / .markdown / .txt\` 文件（也可直接拖放到编辑器）
- 💾 一键下载为 \`.md\` 文件
- 🖨️ 导出 PDF（走浏览器原生打印，CJK 字体 + 分页都正确）
- 🌓 深浅色主题，跟随系统或手动切换
- ⌨️ 键盘快捷键：\`Ctrl+/\` 查看全部
- 💼 草稿自动保存，关闭后再打开会恢复
- 🔒 纯前端，内容只在你本机，**不上传任何服务器**

## 试试看

### 行内样式

支持 **粗体**、*斜体*、~~删除线~~、\`内联代码\`、[超链接](https://example.com)。

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

| 模式 | 适用场景 |
| ---- | -------- |
| WYSIWYG | 写文章、做笔记 |
| IR | 想看见 Markdown 标记的同时即时渲染 |
| SV | 传统左右分屏 |

---

**清空此欢迎文档**：\`Alt+N\` 或工具栏「新建」按钮。
`;
