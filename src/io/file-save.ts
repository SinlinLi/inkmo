// Trigger a download of the given markdown source as a .md file.

import { logger } from '../lib/logger';
import { suggestFilename } from '../lib/sanitize';

const log = logger.scope('file-save');

export interface SaveResult {
  filename: string;
  size: number;
}

export function saveMarkdown(markdown: string, explicitName?: string): SaveResult {
  const filename = explicitName ?? suggestFilename(markdown, 'md');
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // a must be in DOM in some browsers (Firefox) before click() works reliably
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Free the blob URL after the download is queued
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  log.info('file saved', { filename, size: blob.size });
  return { filename, size: blob.size };
}
