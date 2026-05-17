import { describe, expect, it } from 'vitest';
import {
  sanitizeFilename,
  deriveTitle,
  suggestFilename,
  timestampSlug,
} from '../../src/lib/sanitize';

describe('sanitizeFilename', () => {
  it('replaces unsafe chars with underscore', () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j', 'fallback')).toBe('a_b_c_d_e_f_g_h_i_j');
  });

  it('preserves CJK and most unicode', () => {
    expect(sanitizeFilename('我的笔记 2025', 'fallback')).toBe('我的笔记_2025');
  });

  it('falls back when input is empty', () => {
    expect(sanitizeFilename('', 'fallback')).toBe('fallback');
    expect(sanitizeFilename('   ', 'fallback')).toBe('fallback');
  });

  it('truncates very long names', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeFilename(long, 'fallback').length).toBe(80);
  });

  it('escapes Windows reserved names', () => {
    expect(sanitizeFilename('CON', 'fallback')).toBe('_CON');
    expect(sanitizeFilename('com1', 'fallback')).toBe('_com1');
  });

  it('removes trailing dots and spaces', () => {
    expect(sanitizeFilename('hello.  ', 'fallback')).toBe('hello');
  });
});

describe('deriveTitle', () => {
  it('extracts the first H1 heading', () => {
    expect(deriveTitle('# Hello\n## Sub')).toBe('Hello');
  });

  it('trims whitespace', () => {
    expect(deriveTitle('#    Hello    \nbody')).toBe('Hello');
  });

  it('ignores deeper headings', () => {
    expect(deriveTitle('## Only H2\n# Real H1')).toBe('Real H1');
  });

  it('returns empty when no H1', () => {
    expect(deriveTitle('Plain text\n## H2 only')).toBe('');
  });
});

describe('timestampSlug', () => {
  it('formats as YYYYMMDD-HHMMSS', () => {
    const d = new Date(2026, 4, 17, 9, 5, 7); // local time
    expect(timestampSlug(d)).toMatch(/^20260517-090507$/);
  });
});

describe('suggestFilename', () => {
  it('uses derived title when present', () => {
    expect(suggestFilename('# 我的文档\nbody', 'md')).toBe('我的文档.md');
  });

  it('uses untitled-<ts> when no title', () => {
    expect(suggestFilename('body without h1', 'md')).toMatch(/^untitled-\d{8}-\d{6}\.md$/);
  });

  it('strips leading dot in extension', () => {
    expect(suggestFilename('# Foo', '.md')).toBe('Foo.md');
  });
});
