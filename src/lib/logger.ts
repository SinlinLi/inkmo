// Structured logger: 4 levels, console + sessionStorage ring buffer (200 entries),
// exportable as JSON for debugging. ~50 LOC, no external deps.

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  ts: string;
  level: LogLevel;
  scope: string;
  msg: string;
  data?: unknown;
}

const LEVELS: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const STORAGE_KEY = 'inkmo:logs';
const RING_SIZE = 200;

let currentLevel: LogLevel = 'INFO';

function urlDebug(): boolean {
  try {
    return (
      typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')
    );
  } catch {
    return false;
  }
}
if (urlDebug()) currentLevel = 'DEBUG';

function pushBuffer(entry: LogEntry): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const arr: LogEntry[] = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    if (arr.length > RING_SIZE) arr.splice(0, arr.length - RING_SIZE);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    /* sessionStorage may be unavailable in private mode or test envs */
  }
}

function emit(level: LogLevel, scope: string, msg: string, data?: unknown): void {
  if (LEVELS[level] < LEVELS[currentLevel]) return;
  const entry: LogEntry = { ts: new Date().toISOString(), level, scope, msg };
  if (data !== undefined) entry.data = data;
  const head = `[${entry.ts}] [${level.padEnd(5)}] [${scope}] ${msg}`;
  const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  if (data !== undefined) fn(head, data);
  else fn(head);
  pushBuffer(entry);
}

export interface Logger {
  debug(msg: string, data?: unknown): void;
  info(msg: string, data?: unknown): void;
  warn(msg: string, data?: unknown): void;
  error(msg: string, data?: unknown): void;
  scope(name: string): Logger;
}

function build(scopeName: string): Logger {
  return {
    debug: (msg, data) => emit('DEBUG', scopeName, msg, data),
    info: (msg, data) => emit('INFO', scopeName, msg, data),
    warn: (msg, data) => emit('WARN', scopeName, msg, data),
    error: (msg, data) => emit('ERROR', scopeName, msg, data),
    scope: (name) => build(`${scopeName}/${name}`),
  };
}

export const logger: Logger = build('app');

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

export function exportLogs(): LogEntry[] {
  try {
    if (typeof sessionStorage === 'undefined') return [];
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearLogs(): void {
  try {
    sessionStorage?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
