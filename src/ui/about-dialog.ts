import { openDialog } from './dialog';
import { exportLogs } from '../lib/logger';
import { SHORTCUT_TABLE } from './shortcuts';

const APP_NAME = 'Markdown Editor';
const APP_VERSION = '0.1.0';

export function openAbout(): Promise<boolean> {
  const body = document.createElement('div');
  body.innerHTML = `
    <p><strong>${APP_NAME}</strong> v${APP_VERSION}</p>
    <p>所见即所得的 Markdown 在线编辑器 · 纯前端 · MIT License</p>
    <h3 style="margin-top:16px;font-size:14px">技术栈</h3>
    <ul style="margin:0;padding-left:20px">
      <li><a href="https://github.com/Vanessa219/vditor" target="_blank" rel="noreferrer noopener">Vditor</a> — Markdown 编辑器内核</li>
      <li><a href="https://github.com/cure53/DOMPurify" target="_blank" rel="noreferrer noopener">DOMPurify</a> — HTML 清洗</li>
      <li><a href="https://vitejs.dev" target="_blank" rel="noreferrer noopener">Vite</a> + TypeScript</li>
    </ul>
    <h3 style="margin-top:16px;font-size:14px">日志</h3>
    <p style="margin:4px 0"><button id="export-logs" class="btn">下载会话日志</button></p>
  `;
  // Wire log export button
  body.querySelector('#export-logs')?.addEventListener('click', () => {
    const entries = exportLogs();
    const text = entries.map((e) => JSON.stringify(e)).join('\n');
    const blob = new Blob([text], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdeditor-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`;
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
  body.innerHTML = `<p style="margin-top:0">键盘快捷键</p>${rows}`;
  return openDialog({ title: '快捷键', body, cancelLabel: null, okLabel: '知道了' });
}
