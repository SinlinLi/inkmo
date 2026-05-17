// Theme controller. Manages light/dark/auto with localStorage persistence
// and prefers-color-scheme listener.

import { logger } from '../lib/logger';
import type { ThemeMode } from '../lib/storage';

const log = logger.scope('theme');

const matcher: MediaQueryList | null =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

let currentMode: ThemeMode = 'auto';
let listeners: Array<(resolved: 'light' | 'dark') => void> = [];

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') return matcher?.matches ? 'dark' : 'light';
  return mode;
}

export function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  currentMode = mode;
  const resolved = resolveTheme(mode);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-mode', mode);
  }
  log.info('theme applied', { mode, resolved });
  for (const fn of listeners) fn(resolved);
  return resolved;
}

export function currentTheme(): ThemeMode {
  return currentMode;
}

export function onThemeChange(fn: (resolved: 'light' | 'dark') => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

// Listen for system preference changes — relevant only when mode === 'auto'.
matcher?.addEventListener?.('change', () => {
  if (currentMode === 'auto') applyTheme('auto');
});
