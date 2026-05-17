// Status bar: word count, line count, mode label, draft-save state.

import type { EditorMode } from '../lib/storage';
import { MODE_LABEL } from '../editor/modes';

export interface StatusbarRefs {
  root: HTMLElement;
  words: HTMLElement;
  lines: HTMLElement;
  mode: HTMLElement;
  draft: HTMLElement;
}

export function buildStatusbar(): StatusbarRefs {
  const root = document.createElement('footer');
  root.className = 'statusbar';
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');

  const words = document.createElement('span');
  words.className = 'sb-item';
  words.innerHTML = '字数 <b>0</b>';

  const lines = document.createElement('span');
  lines.className = 'sb-item';
  lines.innerHTML = '行 <b>1</b>';

  const mode = document.createElement('span');
  mode.className = 'sb-item';
  mode.textContent = `模式 ${MODE_LABEL.ir}`;

  const draft = document.createElement('span');
  draft.className = 'sb-item sb-draft';
  draft.textContent = '草稿就绪';

  root.append(words, lines, mode, draft);
  return { root, words, lines, mode, draft };
}

export function setMetrics(refs: StatusbarRefs, markdown: string): void {
  // Word count: count non-whitespace runs. CJK chars each count as 1.
  const cjk = (markdown.match(/[぀-ヿ㐀-䶿一-鿿豈-﫿]/g) ?? []).length;
  const ascii = (markdown.match(/[A-Za-z0-9]+/g) ?? []).length;
  refs.words.innerHTML = `字数 <b>${cjk + ascii}</b>`;
  const lineCount = markdown.length === 0 ? 1 : markdown.split('\n').length;
  refs.lines.innerHTML = `行 <b>${lineCount}</b>`;
}

export function setModeLabel(refs: StatusbarRefs, m: EditorMode): void {
  refs.mode.textContent = `模式 ${MODE_LABEL[m]}`;
}

export function setDraftStatus(refs: StatusbarRefs, label: string, busy = false): void {
  refs.draft.textContent = label;
  refs.draft.classList.toggle('is-busy', busy);
}
