import { test, expect } from '@playwright/test';

test.describe('pdf export', () => {
  test('触发 PDF 导出会调用 window.print 并暂时应用 .printing 类', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.vditor')).toBeVisible();

    // Hook window.print so we don't actually open a dialog in CI
    await page.evaluate(() => {
      interface TestHooks {
        __printCalled?: boolean;
        __printSnapshot?: string;
        __printingDuringCall?: boolean;
        print: () => void;
      }
      const w = window as unknown as TestHooks;
      w.__printCalled = false;
      w.__printingDuringCall = false;
      w.print = () => {
        w.__printCalled = true;
        w.__printingDuringCall = document.body.classList.contains('printing');
        const container = document.getElementById('print-container');
        w.__printSnapshot = container?.innerHTML ?? '';
        // Simulate the browser firing afterprint
        window.dispatchEvent(new Event('afterprint'));
      };
    });

    // Trigger via our test hook (avoids cross-platform shortcut handling differences)
    await page.evaluate(() => {
      const w = window as unknown as { __inkmo?: { triggerExportPdf(): Promise<void> } };
      return w.__inkmo?.triggerExportPdf();
    });

    // Verify the hook captured the expected state
    const result = await page.evaluate(() => {
      const w = window as unknown as {
        __printCalled?: boolean;
        __printSnapshot?: string;
        __printingDuringCall?: boolean;
      };
      return {
        called: w.__printCalled,
        printing: w.__printingDuringCall,
        snapshotHasH1: (w.__printSnapshot ?? '').includes('欢迎使用'),
      };
    });

    expect(result.called).toBe(true);
    expect(result.printing).toBe(true);
    expect(result.snapshotHasH1).toBe(true);

    // After afterprint, .printing class should be removed
    await expect(page.locator('body.printing')).toHaveCount(0);
  });
});
