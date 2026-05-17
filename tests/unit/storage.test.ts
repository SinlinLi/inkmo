import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  DEFAULT_SETTINGS,
  clearState,
  debounce,
  loadState,
  saveState,
} from '../../src/lib/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadState returns null when nothing stored', () => {
    expect(loadState()).toBeNull();
  });

  it('saveState then loadState round-trips', () => {
    const ok = saveState({ draft: '# hi', settings: { ...DEFAULT_SETTINGS, theme: 'dark' } });
    expect(ok).toBe(true);
    const loaded = loadState();
    expect(loaded).not.toBeNull();
    expect(loaded!.draft).toBe('# hi');
    expect(loaded!.settings.theme).toBe('dark');
    expect(loaded!.schemaVersion).toBe(1);
  });

  it('discards state with mismatched schema version', () => {
    localStorage.setItem(
      'inkmo:state',
      JSON.stringify({ schemaVersion: 999, draft: 'oops', settings: DEFAULT_SETTINGS }),
    );
    expect(loadState()).toBeNull();
  });

  it('merges loaded settings on top of defaults', () => {
    saveState({ draft: '', settings: { ...DEFAULT_SETTINGS, theme: 'dark' } });
    const loaded = loadState();
    expect(loaded!.settings.editorMode).toBe(DEFAULT_SETTINGS.editorMode);
    expect(loaded!.settings.theme).toBe('dark');
  });

  it('clearState removes the entry', () => {
    saveState({ draft: 'x', settings: DEFAULT_SETTINGS });
    clearState();
    expect(loadState()).toBeNull();
  });

  it('saveState returns false when localStorage throws', () => {
    const spy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    try {
      expect(saveState({ draft: 'x', settings: DEFAULT_SETTINGS })).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('debounce', () => {
  it('coalesces rapid calls', () => {
    vi.useFakeTimers();
    let count = 0;
    const fn = debounce(() => count++, 100);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    vi.advanceTimersByTime(99);
    expect(count).toBe(0);
    vi.advanceTimersByTime(2);
    expect(count).toBe(1);
    vi.useRealTimers();
  });

  it('passes arguments to the wrapped function', () => {
    vi.useFakeTimers();
    const seen: number[] = [];
    const fn = debounce((n: number) => seen.push(n), 50);
    fn(1);
    fn(2);
    fn(3);
    vi.advanceTimersByTime(60);
    expect(seen).toEqual([3]);
    vi.useRealTimers();
  });
});
