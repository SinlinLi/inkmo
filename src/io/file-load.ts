// Read a local Markdown / text file into a UTF-8 string.

import { logger } from '../lib/logger';

const log = logger.scope('file-load');

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = ['.md', '.markdown', '.txt'];
const ALLOWED_MIME = [
  'text/markdown',
  'text/x-markdown',
  'text/plain',
  '', // browsers often leave it blank for .md
];

export interface LoadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
}

export class FileLoadError extends Error {
  constructor(
    msg: string,
    public code: 'TYPE' | 'SIZE' | 'READ',
  ) {
    super(msg);
    this.name = 'FileLoadError';
  }
}

export function isAcceptable(file: File): boolean {
  const lower = file.name.toLowerCase();
  const extOk = ALLOWED_EXT.some((e) => lower.endsWith(e));
  const mimeOk = ALLOWED_MIME.includes(file.type);
  return extOk || mimeOk;
}

export function readFile(file: File): Promise<LoadedFile> {
  return new Promise((resolve, reject) => {
    if (!isAcceptable(file)) {
      reject(new FileLoadError(`不支持的文件类型: ${file.name}`, 'TYPE'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(
        new FileLoadError(`文件过大: ${(file.size / 1024 / 1024).toFixed(2)} MB > 5 MB`, 'SIZE'),
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (): void => {
      const content = String(reader.result ?? '');
      log.info('file loaded', { name: file.name, size: file.size, type: file.type });
      resolve({ name: file.name, size: file.size, type: file.type, content });
    };
    reader.onerror = (): void => {
      log.error('file read failed', { name: file.name, err: String(reader.error) });
      reject(new FileLoadError(`读取失败: ${file.name}`, 'READ'));
    };
    reader.readAsText(file, 'utf-8');
  });
}
