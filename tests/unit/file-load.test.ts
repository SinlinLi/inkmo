import { describe, expect, it } from 'vitest';
import { FileLoadError, MAX_BYTES, isAcceptable, readFile } from '../../src/io/file-load';

function makeFile(name: string, content: string, type = ''): File {
  return new File([content], name, { type });
}

describe('isAcceptable', () => {
  it('accepts .md / .markdown / .txt extensions', () => {
    expect(isAcceptable(makeFile('doc.md', ''))).toBe(true);
    expect(isAcceptable(makeFile('doc.markdown', ''))).toBe(true);
    expect(isAcceptable(makeFile('doc.txt', ''))).toBe(true);
  });

  it('accepts mime-only matches', () => {
    expect(isAcceptable(makeFile('untyped', '', 'text/markdown'))).toBe(true);
    expect(isAcceptable(makeFile('plain', '', 'text/plain'))).toBe(true);
  });

  it('rejects unknown extensions and mimes', () => {
    expect(isAcceptable(makeFile('image.png', '', 'image/png'))).toBe(false);
    expect(isAcceptable(makeFile('app.exe', '', 'application/x-msdownload'))).toBe(false);
  });
});

describe('readFile', () => {
  it('reads valid UTF-8 markdown', async () => {
    const f = makeFile('hello.md', '# 你好\n世界', 'text/markdown');
    const out = await readFile(f);
    expect(out.content).toBe('# 你好\n世界');
    expect(out.name).toBe('hello.md');
  });

  it('rejects unsupported types with code TYPE', async () => {
    const f = makeFile('a.bin', 'x', 'application/octet-stream');
    await expect(readFile(f)).rejects.toMatchObject({
      name: 'FileLoadError',
      code: 'TYPE',
    });
  });

  it('rejects files larger than MAX_BYTES with code SIZE', async () => {
    // Construct a fake file with size > MAX_BYTES without actually allocating
    const blob = new Blob(['x']);
    Object.defineProperty(blob, 'size', { value: MAX_BYTES + 1 });
    const f = new File([blob], 'big.md', { type: 'text/markdown' });
    Object.defineProperty(f, 'size', { value: MAX_BYTES + 1 });
    await expect(readFile(f)).rejects.toMatchObject({
      name: 'FileLoadError',
      code: 'SIZE',
    });
  });

  it('FileLoadError carries a message and code', () => {
    const e = new FileLoadError('m', 'TYPE');
    expect(e.message).toBe('m');
    expect(e.code).toBe('TYPE');
    expect(e.name).toBe('FileLoadError');
  });
});
