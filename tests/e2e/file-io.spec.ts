import { test, expect } from '@playwright/test';

test.describe('file io', () => {
  test('上传 .md 文件后编辑器内容更新', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.vditor')).toBeVisible();

    // Inject a file via the hidden input
    const inputHandle = await page.locator('input[type="file"]').elementHandle();
    expect(inputHandle).not.toBeNull();
    await inputHandle!.setInputFiles({
      name: 'test-doc.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# Hello CJK 你好\n\n上传成功'),
    });

    // The toast confirms; status bar word count rises above the welcome doc baseline 0
    await expect(page.getByText('已载入 test-doc.md')).toBeVisible();

    // The editor now shows the new content (Vditor renders <h1>Hello CJK 你好</h1>)
    await expect(
      page.locator('.vditor').getByRole('heading', { level: 1, name: /Hello CJK 你好/ }),
    ).toBeVisible();
  });

  test('下载按钮触发 .md blob 下载，文件名来自 H1', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.vditor')).toBeVisible();

    // Set editor content via our test hook
    await page.evaluate(() => {
      const w = window as unknown as { __inkmo?: { setValue(v: string): void } };
      w.__inkmo?.setValue('# Hello Download\n\nbody');
    });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /下载.*\.md/ }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('Hello_Download.md');
  });
});
