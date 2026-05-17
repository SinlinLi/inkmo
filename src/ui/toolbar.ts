// Custom top toolbar. Wired by app.ts via callbacks; no Vditor dependency.

import type { EditorMode } from '../lib/storage';
import { MODE_LABEL } from '../editor/modes';
import { ICONS, type IconName } from './icons';

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
  icon: IconName | null,
  label: string,
  title: string,
  onClick: () => void,
  extraClass = '',
): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `tb-btn ${extraClass}`.trim();
  const parts: string[] = [];
  if (icon) parts.push(`<span class="tb-ico" aria-hidden="true">${ICONS[icon]}</span>`);
  if (label) parts.push(`<span class="tb-label">${label}</span>`);
  b.innerHTML = parts.join('');
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

  // Brand: ink-drop mark + 「墨」wordmark on the left, acts as visual anchor.
  const brand = document.createElement('div');
  brand.className = 'tb-brand';
  brand.innerHTML = `<span class="tb-brand-mark" aria-hidden="true">${ICONS.brand}</span><span class="tb-brand-name">墨</span>`;
  brand.title = '墨 · Markdown 编辑器';

  const divider = document.createElement('div');
  divider.className = 'tb-divider';
  divider.setAttribute('aria-hidden', 'true');

  // Left group: file ops
  const left = document.createElement('div');
  left.className = 'tb-group';
  left.appendChild(btn('new', '新建', '新建 (Alt+N)', h.onNew));
  left.appendChild(btn('open', '打开', '打开本地文件 (Alt+O)', h.onOpen));
  left.appendChild(btn('download', '下载', '下载 .md (Ctrl+Shift+S)', h.onDownload));
  left.appendChild(btn('print', 'PDF', '导出 PDF (Ctrl+Shift+E)', h.onExportPdf));

  const sep = document.createElement('div');
  sep.className = 'tb-sep';

  // Right group: view
  const right = document.createElement('div');
  right.className = 'tb-group tb-right';

  // Mode button: icon + label + badge.
  // Hidden on mobile (≤720px) — narrow viewports only use IR.
  const modeBadge = document.createElement('span');
  modeBadge.className = 'tb-badge';
  modeBadge.textContent = MODE_LABEL.ir;
  const modeBtn = btn('layout', '模式', '切换编辑模式 (Ctrl+Shift+M)', h.onCycleMode);
  modeBtn.classList.add('tb-mode-btn');
  modeBtn.appendChild(modeBadge);

  // Theme button: icon + label + badge
  const themeBadge = document.createElement('span');
  themeBadge.className = 'tb-badge';
  themeBadge.textContent = '自动';
  const themeBtn = btn('theme', '主题', '切换主题 (Ctrl+Shift+T)', h.onCycleTheme);
  themeBtn.appendChild(themeBadge);

  right.appendChild(modeBtn);
  right.appendChild(themeBtn);
  right.appendChild(btn('settings', '', '设置 (Ctrl+,)', h.onSettings, 'tb-icon'));
  right.appendChild(btn('help', '', '快捷键 (Ctrl+/)', h.onHelp, 'tb-icon'));
  right.appendChild(btn('info', '', '关于', h.onAbout, 'tb-icon'));

  root.appendChild(brand);
  root.appendChild(divider);
  root.appendChild(left);
  root.appendChild(sep);
  root.appendChild(right);

  return { root, modeBadge, themeBadge };
}

export function setModeBadge(refs: ToolbarRefs, mode: EditorMode): void {
  refs.modeBadge.textContent = MODE_LABEL[mode];
}

export function setThemeBadge(refs: ToolbarRefs, label: string): void {
  refs.themeBadge.textContent = label;
}
