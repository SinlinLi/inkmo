// Persistence layer for draft content + user settings.
// Schema-versioned so future migrations don't crash on stale localStorage.

import { logger } from './logger';

const log = logger.scope('storage');
const KEY = 'inkmo:state';
const SCHEMA_VERSION = 1;

export type ThemeMode = 'light' | 'dark' | 'auto';
export type EditorMode = 'wysiwyg' | 'ir' | 'sv';

export interface Settings {
  theme: ThemeMode;
  editorMode: EditorMode;
  enableMath: boolean;
  enableMermaid: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}

export interface PersistedState {
  schemaVersion: number;
  draft: string;
  settings: Settings;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  editorMode: 'ir',
  enableMath: false,
  enableMermaid: false,
  logLevel: 'INFO',
};

export function loadState(): PersistedState | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      log.warn('state schema mismatch, discarding', {
        found: parsed.schemaVersion,
        expected: SCHEMA_VERSION,
      });
      return null;
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      draft: parsed.draft ?? '',
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch (err) {
    log.error('loadState failed', { err: String(err) });
    return null;
  }
}

export function saveState(state: Omit<PersistedState, 'schemaVersion' | 'updatedAt'>): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const payload: PersistedState = {
      ...state,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    // QuotaExceededError is common when draft is huge
    log.warn('saveState failed', { err: String(err) });
    return false;
  }
}

export function clearState(): void {
  try {
    localStorage?.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Debounce helper used by the draft auto-save.
export function debounce<F extends (...args: never[]) => void>(fn: F, wait: number): F {
  let t: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<F>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  }) as F;
}
