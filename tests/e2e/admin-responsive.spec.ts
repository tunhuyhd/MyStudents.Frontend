import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { adminUsers, longVietnameseClassName, longEnglishClassName, openAdminUsers } from './fixtures/admin';

const artifactDirectory = path.resolve(process.cwd(), 'artifacts/admin-responsive');

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
      const name = element.querySelector<HTMLElement>('td:first-child button:nth-of-type(1) span');
      const username = element.querySelector<HTMLElement>('td:first-child button:nth-of-type(2) span');
      const email = element.querySelector<HTMLElement>('td:nth-child(2) button span');
      return [
        ['fullName', name],
        ['username', username],
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

    const localized = language === 'vi'
      ? {
          region: 'Bảng quản lý người dùng',
          hint: 'Cuộn ngang để xem đầy đủ các cột và thao tác.',
          fullName: `Hiện đầy đủ họ tên: ${adminUsers[0].fullName}`,
          fullUsername: `Hiện đầy đủ tên đăng nhập: @${adminUsers[0].username}`,
          fullEmail: `Hiện đầy đủ địa chỉ email: ${adminUsers[0].email}`,
        }
      : {
          region: 'User management table',
          hint: 'Scroll horizontally to view all columns and actions.',
          fullName: `Show full name: ${adminUsers[0].fullName}`,
          fullUsername: `Show full username: @${adminUsers[0].username}`,
          fullEmail: `Show full email address: ${adminUsers[0].email}`,
        };
    await expect(scrollRegion).toHaveAttribute('aria-label', localized.region);
    const hasOverflow = scrollGeometry.scrollWidth > scrollGeometry.clientWidth + 1;
    if (hasOverflow) {
      const scrollHint = page.locator('#admin-user-table-scroll-hint');
      await expect(scrollHint).toBeVisible();
      await expect(scrollHint).toContainText(localized.hint);
      await expect(scrollRegion).toHaveAttribute('tabindex', '0');
      await expect(scrollRegion).toHaveAttribute('aria-describedby', 'admin-user-table-scroll-hint');
    } else {
      await expect(page.locator('#admin-user-table-scroll-hint')).toHaveCount(0);
      await expect(scrollRegion).not.toHaveAttribute('tabindex', '0');
    }

    const fullNameToggle = row.locator('td:first-child button').nth(0);
    const usernameToggle = row.locator('td:first-child button').nth(1);
    const emailToggle = row.locator('td:nth-child(2) button');
    await expect(fullNameToggle).toHaveAttribute('aria-label', localized.fullName);
    await expect(usernameToggle).toHaveAttribute('aria-label', localized.fullUsername);
    await expect(emailToggle).toHaveAttribute('aria-label', localized.fullEmail);
    await expect(fullNameToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(usernameToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(emailToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(fullNameToggle).not.toHaveAttribute('title', /.+/);
    await expect(usernameToggle).not.toHaveAttribute('title', /.+/);
    await expect(emailToggle).not.toHaveAttribute('title', /.+/);

    await fullNameToggle.click();
    await expect(fullNameToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(fullNameToggle).toContainText(adminUsers[0].fullName);
    await usernameToggle.focus();
    await page.keyboard.press('Enter');
    await expect(usernameToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(usernameToggle).toContainText(`@${adminUsers[0].username}`);
    await emailToggle.focus();
    await page.keyboard.press('Enter');
    await expect(emailToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(emailToggle).toContainText(adminUsers[0].email);
    const revealedValuesHaveFocusStyle = await emailToggle.evaluate((element) => {
      (element as HTMLElement).focus();
      return element.matches(':focus-visible') && getComputedStyle(element).outlineStyle !== 'none';
    });
    expect(revealedValuesHaveFocusStyle).toBe(true);

    const headers = await table.getByRole('columnheader').all();
    expect(headers).toHaveLength(5);
    const finalHeader = headers[4];
    let keyboardScrollLeft = 0;
    let scrollRegionHasVisibleFocus = false;
    if (hasOverflow) {
      await scrollRegion.evaluate((element) => { element.scrollLeft = 0; });
      await scrollRegion.focus();
      scrollRegionHasVisibleFocus = await scrollRegion.evaluate((element) => element.matches(':focus-visible') && getComputedStyle(element).outlineStyle !== 'none');
      expect(scrollRegionHasVisibleFocus).toBe(true);
      for (let key = 0; key < 200; key++) {
        const finalActionIsVisible = await finalHeader.evaluate((element) => {
          const parent = element.closest('[role="region"]')!;
          const header = element.getBoundingClientRect();
          const region = parent.getBoundingClientRect();
          // Allow 1 CSS px for fractional layout rounding at the maximum scroll position.
          return header.left >= region.left - 1 && header.right <= region.right + 1;
        });
        if (finalActionIsVisible) break;
        await page.keyboard.press('ArrowRight');
      }
      keyboardScrollLeft = await scrollRegion.evaluate((element) => element.scrollLeft);
      expect(keyboardScrollLeft).toBeGreaterThan(0);
      const keyboardVisibleAction = await finalHeader.evaluate((element) => {
        const parent = element.closest('[role="region"]')!;
        const header = element.getBoundingClientRect();
        const region = parent.getBoundingClientRect();
        return header.left >= region.left - 1 && header.right <= region.right + 1;
      });
      expect(keyboardVisibleAction).toBe(true);

      await scrollRegion.evaluate((element) => { element.scrollLeft = 0; });
      const regionBox = await scrollRegion.boundingBox();
      expect(regionBox).not.toBeNull();
      await page.mouse.move(regionBox!.x + regionBox!.width / 2, regionBox!.y + regionBox!.height / 2);
      await page.mouse.wheel(5_000, 0);
      await expect.poll(() => scrollRegion.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      await scrollRegion.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    }
    const finalHeaderBox = await finalHeader.boundingBox();
    const scrollerBox = await scrollRegion.boundingBox();
    expect(finalHeaderBox).not.toBeNull();
    expect(scrollerBox).not.toBeNull();
    expect(finalHeaderBox!.x + finalHeaderBox!.width).toBeGreaterThan(scrollerBox!.x);
    expect(finalHeaderBox!.x).toBeLessThan(scrollerBox!.x + scrollerBox!.width);

    await mkdir(artifactDirectory, { recursive: true });
    const screenshotPath = path.join(artifactDirectory, `admin-v2-${width}px.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const roleButton = row.locator('td:nth-child(5) button').first();
    await roleButton.scrollIntoViewIfNeeded();
    await expect(roleButton).toBeVisible();
    await roleButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Student', exact: true }).last()).toBeVisible();

    await page.getByRole('button', { name: language === 'vi' ? 'Người dùng' : 'Users', exact: true }).click();
    const activeStatus = row.locator('td:nth-child(4) button');
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

    const verification = { width, language, longContentMetrics, scrollGeometry, hasOverflow, keyboardScrollLeft, scrollRegionHasVisibleFocus, revealedValuesHaveFocusStyle, screenshotPath, toastLayout };
    test.info().annotations.push({
      type: 'responsive-measurement',
      description: JSON.stringify(verification),
    });
    await writeFile(path.join(artifactDirectory, `admin-v2-${width}px.json`), JSON.stringify(verification, null, 2), 'utf8');
    await test.info().attach(`admin-v2-${width}px.json`, {
      body: JSON.stringify(verification, null, 2),
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
  const statusButton = row.locator('td:nth-child(4) button');
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
