import { describe, expect, it, beforeEach } from 'vitest';
import { logger, setLogLevel, exportLogs, clearLogs, getLogLevel } from '../../src/lib/logger';

describe('logger', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setLogLevel('DEBUG');
    clearLogs();
  });

  it('writes entries to sessionStorage', () => {
    logger.info('hello', { a: 1 });
    const entries = exportLogs();
    expect(entries).toHaveLength(1);
    expect(entries[0].msg).toBe('hello');
    expect(entries[0].level).toBe('INFO');
    expect(entries[0].scope).toBe('app');
    expect(entries[0].data).toEqual({ a: 1 });
  });

  it('respects level filtering', () => {
    setLogLevel('WARN');
    logger.debug('hidden');
    logger.info('hidden');
    logger.warn('visible');
    logger.error('visible too');
    const entries = exportLogs();
    expect(entries.map((e) => e.msg)).toEqual(['visible', 'visible too']);
  });

  it('caps the ring buffer at 200 entries', () => {
    for (let i = 0; i < 250; i++) logger.info(`m${i}`);
    const entries = exportLogs();
    expect(entries).toHaveLength(200);
    expect(entries[0].msg).toBe('m50');
    expect(entries[199].msg).toBe('m249');
  });

  it('supports nested scopes', () => {
    const childLog = logger.scope('editor').scope('vditor');
    childLog.info('ready');
    const entries = exportLogs();
    expect(entries[0].scope).toBe('app/editor/vditor');
  });

  it('getLogLevel reflects setLogLevel', () => {
    setLogLevel('ERROR');
    expect(getLogLevel()).toBe('ERROR');
  });

  it('clearLogs empties the buffer', () => {
    logger.info('test');
    expect(exportLogs()).toHaveLength(1);
    clearLogs();
    expect(exportLogs()).toHaveLength(0);
  });

  it('includes ISO timestamp on each entry', () => {
    logger.info('ts');
    const e = exportLogs()[0];
    expect(e.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
