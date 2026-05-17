// Application bootstrap. Wires Vditor, toolbar, status bar, IO, shortcuts, dialogs.

import { createVditor, WELCOME_DOC, type VditorWrapper } from './editor/vditor-setup';
import { applyTheme, currentTheme, onThemeChange, resolveTheme } from './editor/theme';
import { nextMode } from './editor/modes';
import { logger, setLogLevel } from './lib/logger';
import {
  DEFAULT_SETTINGS,
  loadState,
  saveState,
  debounce,
  type EditorMode,
  type PersistedState,
  type Settings,
  type ThemeMode,
} from './lib/storage';
import { readFile, FileLoadError } from './io/file-load';
import { saveMarkdown } from './io/file-save';
import { exportPdf } from './io/pdf-export';
import { buildToolbar, setModeBadge, setThemeBadge, type ToolbarRefs } from './ui/toolbar';
import {
  buildStatusbar,
  setMetrics,
  setModeLabel,
  setDraftStatus,
  type StatusbarRefs,
} from './ui/statusbar';
import { installDropzone } from './ui/dropzone';
import { installShortcuts } from './ui/shortcuts';
import { toast } from './ui/toast';
import { openAbout, openHelp } from './ui/about-dialog';
import { openSettings } from './ui/settings-dialog';
import { openDialog } from './ui/dialog';

const log = logger.scope('app');

const themeLabel = (mode: ThemeMode): string =>
  mode === 'auto' ? '自动' : mode === 'dark' ? '深色' : '浅色';

const cycleTheme = (mode: ThemeMode): ThemeMode =>
  mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto';

export async function bootstrap(root: HTMLElement): Promise<void> {
  log.info('app boot', {
    ua: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  });

  // ── Load persisted state
  const persisted: PersistedState | null = loadState();
  const settings: Settings = persisted?.settings ?? { ...DEFAULT_SETTINGS };
  setLogLevel(settings.logLevel);
  applyTheme(settings.theme);
  const initial =
    persisted?.draft && persisted.draft.trim().length > 0 ? persisted.draft : WELCOME_DOC;
  const restored = !!(persisted && persisted.draft && persisted.draft.trim().length > 0);

  // ── Build shell
  const editorHost = document.createElement('main');
  editorHost.className = 'editor-host';

  const toolbarRefs: ToolbarRefs = buildToolbar({
    onNew: () => onNew(),
    onOpen: () => triggerOpen(),
    onDownload: () => onDownload(),
    onExportPdf: () => onExportPdf(),
    onCycleMode: () => onCycleMode(),
    onCycleTheme: () => onCycleTheme(),
    onSettings: () => onSettings(),
    onAbout: () => void openAbout(),
    onHelp: () => void openHelp(),
  });
  const statusbarRefs: StatusbarRefs = buildStatusbar();

  root.appendChild(toolbarRefs.root);
  root.appendChild(editorHost);
  root.appendChild(statusbarRefs.root);

  setModeBadge(toolbarRefs, settings.editorMode);
  setThemeBadge(toolbarRefs, themeLabel(settings.theme));
  setModeLabel(statusbarRefs, settings.editorMode);
  setMetrics(statusbarRefs, initial);

  // Hidden file input for the toolbar "open" path
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'file';
  hiddenInput.accept = '.md,.markdown,.txt,text/markdown,text/plain';
  hiddenInput.style.display = 'none';
  hiddenInput.addEventListener('change', async () => {
    const file = hiddenInput.files?.[0];
    if (file) await onFile(file);
    hiddenInput.value = '';
  });
  root.appendChild(hiddenInput);

  // ── Persist state (debounced)
  let currentSettings: Settings = settings;
  const persist = debounce((markdown: string): void => {
    const ok = saveState({ draft: markdown, settings: currentSettings });
    setDraftStatus(
      statusbarRefs,
      ok ? `草稿已保存 · ${new Date().toLocaleTimeString()}` : '草稿保存失败',
    );
  }, 500);

  // ── Vditor instance
  let vditor: VditorWrapper | null = null;

  const initVditor = async (initialDoc: string, editorMode: EditorMode): Promise<VditorWrapper> => {
    return createVditor({
      container: editorHost,
      initial: initialDoc,
      settings: { ...currentSettings, editorMode },
      onInput: (value: string) => {
        setMetrics(statusbarRefs, value);
        setDraftStatus(statusbarRefs, '保存中…', true);
        persist(value);
      },
    });
  };

  vditor = await initVditor(initial, settings.editorMode);
  if (restored) toast('已恢复上次草稿', 'info');

  // ── Theme listener: keep Vditor in sync
  onThemeChange((resolved) => {
    setThemeBadge(toolbarRefs, themeLabel(currentTheme()));
    vditor?.applyTheme(resolved);
  });

  // ── Dropzone
  installDropzone((file) => void onFile(file));

  // ── Shortcuts
  installShortcuts({
    onNew: () => onNew(),
    onOpen: () => triggerOpen(),
    onDownload: () => onDownload(),
    onExportPdf: () => onExportPdf(),
    onCycleMode: () => onCycleMode(),
    onCycleTheme: () => onCycleTheme(),
    onSettings: () => onSettings(),
    onHelp: () => void openHelp(),
  });

  // ── Handlers

  async function onFile(file: File): Promise<void> {
    try {
      const loaded = await readFile(file);
      vditor?.setValue(loaded.content);
      setMetrics(statusbarRefs, loaded.content);
      toast(`已载入 ${loaded.name}`, 'success');
    } catch (err) {
      if (err instanceof FileLoadError) toast(err.message, 'warn');
      else {
        log.error('file load unknown error', { err: String(err) });
        toast('读取失败', 'error');
      }
    }
  }

  function triggerOpen(): void {
    hiddenInput.click();
  }

  async function onNew(): Promise<void> {
    const ok = await openDialog({
      title: '新建',
      body: '将清空当前编辑器内容并重置为欢迎文档。确认继续？',
      okLabel: '清空',
    });
    if (!ok) return;
    vditor?.setValue(WELCOME_DOC);
    setMetrics(statusbarRefs, WELCOME_DOC);
    persist(WELCOME_DOC);
    toast('已重置', 'info');
  }

  function onDownload(): void {
    const md = vditor?.getValue() ?? '';
    if (!md) {
      toast('编辑器内容为空', 'warn');
      return;
    }
    const r = saveMarkdown(md);
    toast(`已下载 ${r.filename}`, 'success');
  }

  async function onExportPdf(): Promise<void> {
    const html = vditor?.getHTML();
    if (!html) {
      toast('编辑器内容为空', 'warn');
      return;
    }
    toast('正在打开打印对话框…', 'info', 2000);
    await exportPdf({ html });
  }

  async function onCycleMode(): Promise<void> {
    const next = nextMode(currentSettings.editorMode);
    currentSettings = { ...currentSettings, editorMode: next };
    setModeBadge(toolbarRefs, next);
    setModeLabel(statusbarRefs, next);
    const value = vditor?.getValue() ?? '';
    vditor?.destroy();
    editorHost.innerHTML = '';
    vditor = await initVditor(value, next);
    persist(value);
    toast(`已切换：${next.toUpperCase()}`, 'info', 1500);
  }

  function onCycleTheme(): void {
    const next = cycleTheme(currentTheme());
    currentSettings = { ...currentSettings, theme: next };
    applyTheme(next);
    setThemeBadge(toolbarRefs, themeLabel(next));
    persist(vditor?.getValue() ?? '');
  }

  async function onSettings(): Promise<void> {
    const r = await openSettings(currentSettings);
    if (!r) return;
    const reloadNeeded =
      r.enableMath !== currentSettings.enableMath ||
      r.enableMermaid !== currentSettings.enableMermaid;
    currentSettings = r;
    applyTheme(r.theme);
    setThemeBadge(toolbarRefs, themeLabel(r.theme));
    persist(vditor?.getValue() ?? '');
    if (reloadNeeded) {
      toast('设置已保存，2 秒后刷新页面以应用扩展…', 'info', 1800);
      setTimeout(() => window.location.reload(), 2000);
    } else {
      toast('设置已保存', 'success');
    }
  }

  // Expose for E2E tests
  (window as unknown as { __mdeditor?: unknown }).__mdeditor = {
    getValue: () => vditor?.getValue() ?? '',
    setValue: (v: string) => vditor?.setValue(v),
    triggerExportPdf: () => onExportPdf(),
  };

  log.info('app ready', {
    restored,
    mode: settings.editorMode,
    theme: resolveTheme(settings.theme),
  });
}
