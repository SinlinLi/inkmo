import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { saveMarkdown } from '../../src/io/file-save';

describe('saveMarkdown', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLSpy = vi.fn(() => 'blob:mock://abc');
    revokeObjectURLSpy = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    });
    clickSpy = vi.fn();
    Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
      value: clickSpy,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('derives filename from first H1', () => {
    const r = saveMarkdown('# 标题\nbody');
    expect(r.filename).toBe('标题.md');
    expect(r.size).toBeGreaterThan(0);
    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('honors explicitName when provided', () => {
    const r = saveMarkdown('whatever', 'override.md');
    expect(r.filename).toBe('override.md');
  });

  it('falls back to untitled-<ts> when no H1', () => {
    const r = saveMarkdown('plain text');
    expect(r.filename).toMatch(/^untitled-\d{8}-\d{6}\.md$/);
  });
});
