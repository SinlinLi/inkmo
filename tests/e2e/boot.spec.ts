import { test, expect } from '@playwright/test';

test.describe('boot', () => {
  test('应用启动后渲染编辑器与工具栏', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    // Title
    await expect(page).toHaveTitle(/墨/);

    // Toolbar buttons (using aria-label for robustness)
    await expect(page.getByRole('button', { name: /新建/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /打开本地文件/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /下载/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /PDF/ })).toBeVisible();

    // Status bar
    await expect(page.locator('.statusbar')).toBeVisible();

    // Vditor was mounted
    await expect(page.locator('.vditor')).toBeVisible();

    // Welcome doc actually rendered. Target the H1 by role (Vditor also mirrors the
    // text into a hidden outline panel — getByText alone matches both).
    await expect(
      page.locator('.vditor').getByRole('heading', { level: 1, name: /欢迎使用 墨/ }),
    ).toBeVisible();

    // No console errors
    expect(consoleErrors).toEqual([]);
  });

  test('键盘 Ctrl+/ 打开快捷键帮助', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.vditor')).toBeVisible();
    await page.keyboard.press('Control+/');
    await expect(page.locator('.dialog h2', { hasText: '快捷键' })).toBeVisible();
  });
});
