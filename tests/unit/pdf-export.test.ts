import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { exportPdf } from '../../src/io/pdf-export';

describe('exportPdf', () => {
  let printSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.classList.remove('printing');
    printSpy = vi.fn(() => {
      // simulate browser firing afterprint immediately
      window.dispatchEvent(new Event('afterprint'));
    });
    Object.defineProperty(window, 'print', { value: printSpy, configurable: true });
  });

  afterEach(() => {
    document.body.classList.remove('printing');
  });

  it('injects sanitized html into print-container and calls window.print', async () => {
    const dirty = '<h1>Hi</h1><script>alert(1)</script><p>body</p>';
    const p = exportPdf({ html: dirty });
    // print() is called inside requestAnimationFrame — wait a tick
    await new Promise((r) => setTimeout(r, 30));
    await p;
    expect(printSpy).toHaveBeenCalledOnce();
    // afterprint cleared the container
    const container = document.getElementById('print-container');
    expect(container?.innerHTML).toBe('');
    expect(document.body.classList.contains('printing')).toBe(false);
  });

  it('removes script tags from the rendered HTML before print', async () => {
    const dirty = '<h1>Hi</h1><script>alert(1)</script>';
    let snapshot = '';
    Object.defineProperty(window, 'print', {
      value: vi.fn(() => {
        snapshot = document.getElementById('print-container')?.innerHTML ?? '';
        window.dispatchEvent(new Event('afterprint'));
      }),
      configurable: true,
    });
    await new Promise<void>((resolve) => {
      exportPdf({ html: dirty }).then(resolve);
    });
    expect(snapshot).toContain('Hi');
    expect(snapshot).not.toContain('<script>');
    expect(snapshot).not.toContain('alert(1)');
  });

  it('toggles body.printing while printing and removes it after', async () => {
    let duringPrint = false;
    Object.defineProperty(window, 'print', {
      value: vi.fn(() => {
        duringPrint = document.body.classList.contains('printing');
        window.dispatchEvent(new Event('afterprint'));
      }),
      configurable: true,
    });
    await exportPdf({ html: '<p>x</p>' });
    expect(duringPrint).toBe(true);
    expect(document.body.classList.contains('printing')).toBe(false);
  });
});
