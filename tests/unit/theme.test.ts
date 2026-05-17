import { describe, expect, it, beforeEach } from 'vitest';
import { applyTheme, currentTheme, onThemeChange, resolveTheme } from '../../src/editor/theme';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-mode');
  });

  it('applyTheme(light) sets data-theme=light', () => {
    const resolved = applyTheme('light');
    expect(resolved).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light');
    expect(currentTheme()).toBe('light');
  });

  it('applyTheme(dark) sets data-theme=dark', () => {
    const resolved = applyTheme('dark');
    expect(resolved).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applyTheme(auto) resolves via matchMedia', () => {
    const resolved = applyTheme('auto');
    expect(['light', 'dark']).toContain(resolved);
    expect(currentTheme()).toBe('auto');
  });

  it('resolveTheme returns explicit modes verbatim', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('onThemeChange fires on subsequent applyTheme calls and unsubscribes cleanly', () => {
    const events: Array<'light' | 'dark'> = [];
    const off = onThemeChange((r) => events.push(r));
    applyTheme('dark');
    applyTheme('light');
    expect(events).toEqual(['dark', 'light']);
    off();
    applyTheme('dark');
    expect(events).toEqual(['dark', 'light']); // unchanged after unsubscribe
  });
});
