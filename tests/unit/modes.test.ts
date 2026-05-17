import { describe, expect, it } from 'vitest';
import { MODE_LABEL, nextMode } from '../../src/editor/modes';

describe('nextMode', () => {
  it('cycles ir <-> sv as the user-facing pair', () => {
    expect(nextMode('ir')).toBe('sv');
    expect(nextMode('sv')).toBe('ir');
  });

  it('migrates legacy wysiwyg state to ir on next toggle', () => {
    expect(nextMode('wysiwyg')).toBe('ir');
  });
});

describe('MODE_LABEL', () => {
  it('has Chinese labels for every mode', () => {
    expect(MODE_LABEL.wysiwyg).toBe('所见即所得');
    expect(MODE_LABEL.ir).toBe('即时渲染');
    expect(MODE_LABEL.sv).toBe('分屏预览');
  });
});
