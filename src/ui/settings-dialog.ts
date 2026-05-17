import type { Settings, ThemeMode } from '../lib/storage';
import { openDialog } from './dialog';
import { setLogLevel } from '../lib/logger';

export function openSettings(current: Settings): Promise<Settings | null> {
  return new Promise((resolve) => {
    const body = document.createElement('div');

    const themeSel = document.createElement('select');
    for (const t of ['auto', 'light', 'dark'] as ThemeMode[]) {
      const o = document.createElement('option');
      o.value = t;
      o.textContent = t === 'auto' ? '跟随系统' : t === 'light' ? '浅色' : '深色';
      if (t === current.theme) o.selected = true;
      themeSel.appendChild(o);
    }

    const mathChk = document.createElement('input');
    mathChk.type = 'checkbox';
    mathChk.checked = current.enableMath;

    const mermaidChk = document.createElement('input');
    mermaidChk.type = 'checkbox';
    mermaidChk.checked = current.enableMermaid;

    const logSel = document.createElement('select');
    for (const lvl of ['DEBUG', 'INFO', 'WARN', 'ERROR']) {
      const o = document.createElement('option');
      o.value = lvl;
      o.textContent = lvl;
      if (lvl === current.logLevel) o.selected = true;
      logSel.appendChild(o);
    }

    const row = (label: string, control: HTMLElement): HTMLDivElement => {
      const r = document.createElement('div');
      r.className = 'form-row';
      const l = document.createElement('label');
      l.textContent = label;
      r.appendChild(l);
      r.appendChild(control);
      return r;
    };

    body.appendChild(row('主题', themeSel));
    body.appendChild(row('启用 KaTeX 数学公式（重载页面后生效）', mathChk));
    body.appendChild(row('启用 Mermaid 图表（重载页面后生效）', mermaidChk));
    body.appendChild(row('日志级别', logSel));

    const note = document.createElement('p');
    note.style.fontSize = '12px';
    note.style.color = 'var(--fg-muted)';
    note.style.marginTop = '12px';
    note.textContent = '所有设置保存在本机浏览器，永不上传。';
    body.appendChild(note);

    openDialog({
      title: '设置',
      body,
      okLabel: '保存',
      onOk: () => {
        const next: Settings = {
          ...current,
          theme: themeSel.value as ThemeMode,
          enableMath: mathChk.checked,
          enableMermaid: mermaidChk.checked,
          logLevel: logSel.value as Settings['logLevel'],
        };
        setLogLevel(next.logLevel);
        resolve(next);
      },
    }).then((ok) => {
      if (!ok) resolve(null);
    });
  });
}
