import { expect, test } from '@playwright/test';
import { adminUsers, longVietnameseClassName, longEnglishClassName, openAdminUsers } from './fixtures/admin';

const viewportCases = [
  { width: 320, language: 'vi' as const },
  { width: 390, language: 'en' as const },
  { width: 768, language: 'vi' as const },
  { width: 1440, language: 'en' as const },
];

for (const { width, language } of viewportCases) {
  test(`Admin table and Toast remain operable at ${width}px (${language})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openAdminUsers(page, language);

    const table = page.getByRole('table');
    const scrollRegion = table.locator('xpath=..');
    const row = table.getByRole('row').filter({ hasText: adminUsers[0].username });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell').nth(1)).toContainText(adminUsers[0].email);
    const longContentMetrics = await row.evaluate((element) => {
      const name = element.querySelector<HTMLElement>('td:first-child div.font-bold');
      const email = element.querySelector<HTMLElement>('td:nth-child(2)');
      return [
        ['fullName', name],
        ['email', email],
      ].map(([field, node]) => {
        const target = node as HTMLElement | null;
        if (!target) return { field, found: false };
        const style = getComputedStyle(target);
        return {
          field,
          found: true,
          text: target.textContent,
          clientWidth: target.clientWidth,
          scrollWidth: target.scrollWidth,
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
          visuallyTruncated: target.scrollWidth > target.clientWidth && style.textOverflow === 'ellipsis',
          hasTitle: Boolean(target.title),
        };
      });
    });

    const scrollGeometry = await scrollRegion.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      scrollLeft: element.scrollLeft,
      overflowX: getComputedStyle(element).overflowX,
    }));
    expect(['auto', 'scroll']).toContain(scrollGeometry.overflowX);

    const headers = await table.getByRole('columnheader').all();
    expect(headers).toHaveLength(5);
    const finalHeader = headers[4];
    await finalHeader.scrollIntoViewIfNeeded();
    const finalHeaderBox = await finalHeader.boundingBox();
    const scrollerBox = await scrollRegion.boundingBox();
    expect(finalHeaderBox).not.toBeNull();
    expect(scrollerBox).not.toBeNull();
    expect(finalHeaderBox!.x + finalHeaderBox!.width).toBeGreaterThan(scrollerBox!.x);
    expect(finalHeaderBox!.x).toBeLessThan(scrollerBox!.x + scrollerBox!.width);

    const roleButton = row.getByRole('button').last();
    await roleButton.scrollIntoViewIfNeeded();
    await expect(roleButton).toBeVisible();
    await roleButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Student', exact: true }).last()).toBeVisible();

    await page.getByRole('button', { name: 'Users', exact: true }).click();
    const activeStatus = row.getByRole('button').first();
    await page.locator('body').click({ position: { x: width - 2, y: 880 } });
    for (let tab = 0; tab < 80; tab += 1) {
      await page.keyboard.press('Tab');
      if (await activeStatus.evaluate((element) => element === document.activeElement)) break;
    }
    await expect(activeStatus).toBeFocused();
    await page.keyboard.press('Enter');

    const toast = page.locator('main [role="alert"]');
    await expect(toast).toBeVisible();
    const longMessage = language === 'vi' ? longVietnameseClassName : longEnglishClassName;
    await expect(toast).toContainText(longMessage);
    const toastLayout = await toast.evaluate((element) => {
      const message = element.querySelector('p');
      const closeButton = element.querySelector('button');
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        messageHeight: message?.getBoundingClientRect().height ?? 0,
        messageScrollHeight: message?.scrollHeight ?? 0,
        closeVisible: Boolean(closeButton && closeButton.getBoundingClientRect().width > 0),
      };
    });
    expect(toastLayout.left).toBeGreaterThanOrEqual(0);
    expect(toastLayout.right).toBeLessThanOrEqual(width);
    expect(toastLayout.closeVisible).toBe(true);
    expect(toastLayout.height).toBeGreaterThan(0);
    expect(toastLayout.messageHeight).toBeGreaterThan(20);

    await page.waitForTimeout(3_300);
    await expect(toast).toBeVisible();
    const closeName = language === 'vi' ? 'Đóng' : 'Close';
    const closeButton = page.getByRole('button', { name: closeName });
    await closeButton.focus();
    await expect(closeButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(toast).toBeHidden();

    test.info().annotations.push({
      type: 'responsive-measurement',
      description: JSON.stringify({ width, language, longContentMetrics, scrollGeometry, toastLayout }),
    });
    await test.info().attach(`admin-v2-${width}px.json`, {
      body: JSON.stringify({ width, language, longContentMetrics, scrollGeometry, toastLayout }, null, 2),
      contentType: 'application/json',
    });
  });
}

test('Admin controls remain reachable at 720 CSS pixels (200% zoom layout proxy)', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await openAdminUsers(page, 'en');
  const viewportMetrics = await page.evaluate(() => ({
    cssViewportWidth: window.innerWidth,
    cssViewportHeight: window.innerHeight,
  }));
  expect(viewportMetrics.cssViewportWidth).toBe(720);

  const table = page.getByRole('table');
  const headers = await table.getByRole('columnheader').all();
  await headers[4].scrollIntoViewIfNeeded();
  const row = table.getByRole('row').filter({ hasText: adminUsers[0].username });
  const statusButton = row.getByRole('button').first();
  await statusButton.scrollIntoViewIfNeeded();
  await expect(statusButton).toBeVisible();
  await statusButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main [role="alert"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();

  test.info().annotations.push({
    type: 'zoom-layout-proxy',
    description: `${JSON.stringify(viewportMetrics)}; not a native browser zoom test`,
  });
});
