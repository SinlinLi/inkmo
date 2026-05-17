import { openDialog } from './dialog';
import { exportLogs } from '../lib/logger';
import { SHORTCUT_TABLE } from './shortcuts';
import { ICONS } from './icons';

const APP_NAME_CN = '墨';
const APP_NAME_EN = 'Inkmo';
const APP_VERSION = '0.1.0';

export function openAbout(): Promise<boolean> {
  const body = document.createElement('div');
  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
      <span style="display:inline-flex;color:var(--accent);width:32px;height:32px">${ICONS.brand}</span>
      <div>
        <div style="font-size:20px;font-weight:600;line-height:1">${APP_NAME_CN} <span style="color:var(--fg-muted);font-size:14px;font-weight:500;margin-left:4px">${APP_NAME_EN} · v${APP_VERSION}</span></div>
        <div style="font-size:13px;color:var(--fg-muted);margin-top:4px">中英文友好的 Markdown 在线编辑器 · 纯前端 · MIT License</div>
      </div>
    </div>
    <h3 style="margin-top:18px;font-size:13px;color:var(--fg-muted);font-weight:500;text-transform:uppercase;letter-spacing:0.04em">技术栈</h3>
    <ul style="margin:6px 0 0;padding-left:20px;font-size:14px">
      <li><a href="https://github.com/Vanessa219/vditor" target="_blank" rel="noreferrer noopener">Vditor</a> — 编辑器内核</li>
      <li><a href="https://github.com/cure53/DOMPurify" target="_blank" rel="noreferrer noopener">DOMPurify</a> — HTML 清洗</li>
      <li><a href="https://vitejs.dev" target="_blank" rel="noreferrer noopener">Vite</a> + TypeScript</li>
    </ul>
    <h3 style="margin-top:18px;font-size:13px;color:var(--fg-muted);font-weight:500;text-transform:uppercase;letter-spacing:0.04em">调试</h3>
    <p style="margin:6px 0 0"><button id="export-logs" class="btn">下载本次会话日志</button></p>
  `;
  // Wire log export button
  body.querySelector('#export-logs')?.addEventListener('click', () => {
    const entries = exportLogs();
    const text = entries.map((e) => JSON.stringify(e)).join('\n');
    const blob = new Blob([text], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inkmo-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  return openDialog({ title: '关于', body, cancelLabel: null, okLabel: '关闭' });
}

export function openHelp(): Promise<boolean> {
  const body = document.createElement('div');
  const rows = SHORTCUT_TABLE.map(
    ([desc, keys]) => `<div class="shortcut-row"><span>${desc}</span><kbd>${keys}</kbd></div>`,
  ).join('');
  body.innerHTML = rows;
  return openDialog({ title: '快捷键', body, cancelLabel: null, okLabel: '知道了' });
}
