// Custom top toolbar. Wired by app.ts via callbacks; no Vditor dependency.

import type { EditorMode } from '../lib/storage';
import { MODE_LABEL } from '../editor/modes';

export interface ToolbarHandlers {
  onNew(): void;
  onOpen(): void;
  onDownload(): void;
  onExportPdf(): void;
  onCycleMode(): void;
  onCycleTheme(): void;
  onSettings(): void;
  onAbout(): void;
  onHelp(): void;
}

export interface ToolbarRefs {
  root: HTMLElement;
  modeBadge: HTMLElement;
  themeBadge: HTMLElement;
}

function btn(
  label: string,
  title: string,
  onClick: () => void,
  extraClass = '',
): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `tb-btn ${extraClass}`.trim();
  b.innerHTML = label;
  b.title = title;
  b.setAttribute('aria-label', title);
  b.addEventListener('click', onClick);
  return b;
}

export function buildToolbar(h: ToolbarHandlers): ToolbarRefs {
  const root = document.createElement('header');
  root.className = 'toolbar';
  root.setAttribute('role', 'toolbar');
  root.setAttribute('aria-label', '编辑器工具栏');

  // Left group: file ops
  const left = document.createElement('div');
  left.className = 'tb-group';
  left.appendChild(btn('📄 新建', '新建 (Alt+N)', h.onNew));
  left.appendChild(btn('📂 打开', '打开本地文件 (Alt+O)', h.onOpen));
  left.appendChild(btn('💾 下载', '下载 .md (Ctrl+Shift+S)', h.onDownload));
  left.appendChild(btn('📑 PDF', '导出 PDF (Ctrl+Shift+E)', h.onExportPdf));

  const sep = document.createElement('div');
  sep.className = 'tb-sep';

  // Center group: brand
  const brand = document.createElement('div');
  brand.className = 'tb-brand';
  brand.textContent = 'Markdown Editor';

  // Right group: view
  const right = document.createElement('div');
  right.className = 'tb-group tb-right';

  const modeBadge = document.createElement('span');
  modeBadge.className = 'tb-badge';
  modeBadge.textContent = MODE_LABEL.wysiwyg;

  const modeBtn = btn('🎨 模式', '切换编辑模式 (Ctrl+Shift+M)', h.onCycleMode);
  modeBtn.appendChild(modeBadge);

  const themeBadge = document.createElement('span');
  themeBadge.className = 'tb-badge';
  themeBadge.textContent = '自动';

  const themeBtn = btn('🌓 主题', '切换主题 (Ctrl+Shift+T)', h.onCycleTheme);
  themeBtn.appendChild(themeBadge);

  right.appendChild(modeBtn);
  right.appendChild(themeBtn);
  right.appendChild(btn('⚙️', '设置 (Ctrl+,)', h.onSettings, 'tb-icon'));
  right.appendChild(btn('❓', '快捷键 (Ctrl+/)', h.onHelp, 'tb-icon'));
  right.appendChild(btn('ℹ️', '关于', h.onAbout, 'tb-icon'));

  root.appendChild(left);
  root.appendChild(sep);
  root.appendChild(brand);
  root.appendChild(right);

  return { root, modeBadge, themeBadge };
}

export function setModeBadge(refs: ToolbarRefs, mode: EditorMode): void {
  refs.modeBadge.textContent = MODE_LABEL[mode];
}

export function setThemeBadge(refs: ToolbarRefs, label: string): void {
  refs.themeBadge.textContent = label;
}
