import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('teacher guide works on desktop and mobile in both languages without signing in', async ({ page }) => {
  const errors: string[] = [];
  const calls: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('language', 'vi'));
  await page.route('**/api/bff/**', route => {
    calls.push(new URL(route.request().url()).pathname);
    return route.fulfill({ status: 401, json: { message: 'Unauthenticated' } });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/handbook');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hướng dẫn sử dụng');
  await expect(page.getByRole('navigation').first().getByRole('link', { name: 'Hướng dẫn', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#handbook-content > section')).toHaveCount(8);
  await expect(page.locator('#handbook-content')).not.toContainText(/Admin|JWT|Redis|API/);
  await page.evaluate(() => document.fonts.ready);
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: '.impeccable/review/handbook-desktop.png' });
  await page.screenshot({ path: '.impeccable/review/handbook-desktop-full.png', fullPage: true });

  const search = page.getByRole('searchbox');
  await search.fill('diem danh');
  await expect(page.locator('#attendance')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('chủ đề phù hợp');
  await search.fill('xoa lop');
  await expect(page.locator('#classes')).toBeVisible();
  await expect(page.locator('#classes')).toContainText('nút ba chấm');
  await search.fill('doi trang thai ho so');
  await expect(page.locator('#students')).toContainText('Tất cả trạng thái');
  await search.fill('khongtimthayxyz');
  await expect(page.getByRole('heading', { name: 'Chưa tìm thấy hướng dẫn phù hợp' })).toBeVisible();
  await page.getByRole('button', { name: 'Xem toàn bộ hướng dẫn' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('#handbook-content > section')).toHaveCount(8);
  const faq = page.locator('#troubleshooting details').first();
  await faq.locator('summary').click();
  await expect(faq).toHaveAttribute('open', '');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '.impeccable/review/handbook-mobile.png' });
  await page.screenshot({ path: '.impeccable/review/handbook-mobile-full.png', fullPage: true });
  await page.getByRole('button', { name: 'Mở điều hướng' }).click();
  await expect(page.locator('#club-mobile-navigation').getByRole('link', { name: 'Hướng dẫn', exact: true })).toHaveAttribute('href', '/handbook');
  await page.getByRole('button', { name: 'Đóng điều hướng' }).click();
  await page.locator('aside nav').getByRole('link', { name: 'Điểm danh trong mỗi buổi' }).click();
  await expect(page).toHaveURL(/#attendance$/);
  await page.screenshot({ path: '.impeccable/review/handbook-mobile-reading.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('#attendance-heading')).toHaveText('Take attendance');
  await page.evaluate(() => window.scrollTo(0, 0));
  await search.fill('password');
  await expect(page.getByRole('status')).toContainText('matching topics');
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('#handbook-content > section')).toHaveCount(8);
  expect(errors).toEqual([]);
  expect(calls.every(path => path === '/api/bff/auth/me')).toBe(true);
});

test('handbook is discoverable in teacher navigation without crowding the header', async ({ page }) => {
  await page.route('**/api/bff/**', route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path.endsWith('/auth/me') ? {
      id: 'teacher-guide', role: 'User', username: 'teacher', fullName: 'Giáo viên', email: 'teacher@example.test',
    } : [] });
  });
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/handbook');
  await expect(page.locator('.club-nav-links a')).toHaveCount(4);
  const brand = await page.locator('.club-brand').boundingBox();
  const links = await page.locator('.club-nav-links').boundingBox();
  const account = await page.locator('.club-nav-account').boundingBox();
  expect(brand!.x + brand!.width).toBeLessThanOrEqual(links!.x);
  expect(links!.x + links!.width).toBeLessThanOrEqual(account!.x);
});

test('annotated examples load and the image viewer supports mobile zoom, keyboard and both languages', async ({ page }) => {
  await page.route('**/api/bff/**', route => route.fulfill({ status: 401, json: { message: 'Unauthenticated' } }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('language', 'vi'));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/handbook');
  await expect(page.locator('figure')).toHaveCount(10);
  const trigger = page.getByRole('button', { name: 'Phóng to ảnh: Các thao tác ở danh sách học sinh', exact: true });
  await trigger.scrollIntoViewIfNeeded();
  const picture = trigger.locator('img');
  await expect(picture).toHaveJSProperty('complete', true);
  expect(await picture.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(500);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '.impeccable/review/handbook-pictures-desktop.png' });
  await trigger.click();
  const viewer = page.getByRole('dialog', { name: 'Các thao tác ở danh sách học sinh', exact: true });
  await expect(viewer).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(viewer.getByRole('button', { name: 'Đóng ảnh' })).toBeFocused();
  await page.screenshot({ path: '.impeccable/review/handbook-viewer-desktop.png' });
  await page.keyboard.press('Shift+Tab');
  await expect(viewer.getByRole('button', { name: 'Xem kích thước gốc' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.impeccable/review/handbook-pictures-mobile.png' });
  await trigger.click();
  await viewer.getByRole('button', { name: 'Xem kích thước gốc' }).click();
  await expect(viewer.getByRole('button', { name: 'Thu vừa màn hình' })).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: '.impeccable/review/handbook-viewer-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const fullImage = viewer.locator('img');
  expect(await fullImage.evaluate(el => el.parentElement!.scrollWidth > el.parentElement!.clientWidth)).toBe(true);
  await viewer.getByRole('button', { name: 'Đóng ảnh' }).click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('figure')).toHaveCount(10);
  await expect(page.locator('#students figure img')).toHaveAttribute('src', '/handbook/en/students.jpg');
  for (const language of ['vi', 'en']) {
    for (const name of ['account', 'students', 'classes', 'class-details', 'class-schedule', 'enrollment', 'schedule', 'attendance', 'profile', 'security']) {
      const response = await page.request.get(`/handbook/${language}/${name}.jpg`);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/jpeg');
    }
  }
});
