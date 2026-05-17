// Keyboard shortcut dispatcher.
// We avoid Ctrl+N / Ctrl+O / Ctrl+S / Ctrl+P (browser-reserved) and use
// Alt-/Shift-combos for editor-level commands.

export interface ShortcutMap {
  onNew?(): void;
  onOpen?(): void;
  onDownload?(): void;
  onExportPdf?(): void;
  onCycleMode?(): void;
  onCycleTheme?(): void;
  onSettings?(): void;
  onHelp?(): void;
}

export function installShortcuts(map: ShortcutMap): () => void {
  const handler = (e: KeyboardEvent): void => {
    const ctrl = e.ctrlKey || e.metaKey;
    const alt = e.altKey;
    const shift = e.shiftKey;
    const k = e.key.toLowerCase();

    // Alt+N — new
    if (alt && !ctrl && !shift && k === 'n' && map.onNew) {
      e.preventDefault();
      map.onNew();
      return;
    }
    // Alt+O — open
    if (alt && !ctrl && !shift && k === 'o' && map.onOpen) {
      e.preventDefault();
      map.onOpen();
      return;
    }
    // Ctrl+Shift+S — download .md
    if (ctrl && shift && !alt && k === 's' && map.onDownload) {
      e.preventDefault();
      map.onDownload();
      return;
    }
    // Ctrl+Shift+E — export PDF
    if (ctrl && shift && !alt && k === 'e' && map.onExportPdf) {
      e.preventDefault();
      map.onExportPdf();
      return;
    }
    // Ctrl+Shift+M — cycle mode
    if (ctrl && shift && !alt && k === 'm' && map.onCycleMode) {
      e.preventDefault();
      map.onCycleMode();
      return;
    }
    // Ctrl+Shift+T — cycle theme
    if (ctrl && shift && !alt && k === 't' && map.onCycleTheme) {
      e.preventDefault();
      map.onCycleTheme();
      return;
    }
    // Ctrl+, — settings
    if (ctrl && !alt && !shift && e.key === ',' && map.onSettings) {
      e.preventDefault();
      map.onSettings();
      return;
    }
    // Ctrl+/ — help (shortcuts dialog)
    if (ctrl && !alt && !shift && e.key === '/' && map.onHelp) {
      e.preventDefault();
      map.onHelp();
      return;
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}

export const SHORTCUT_TABLE: Array<[string, string]> = [
  ['新建（清空）', 'Alt + N'],
  ['打开本地文件', 'Alt + O'],
  ['下载 .md', 'Ctrl/Cmd + Shift + S'],
  ['导出 PDF', 'Ctrl/Cmd + Shift + E'],
  ['切换编辑模式', 'Ctrl/Cmd + Shift + M'],
  ['切换主题', 'Ctrl/Cmd + Shift + T'],
  ['设置', 'Ctrl/Cmd + ,'],
  ['本帮助', 'Ctrl/Cmd + /'],
];
