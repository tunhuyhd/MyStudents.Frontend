import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { openAdminUsers } from './fixtures/admin';

const artifactDirectory = path.resolve(process.cwd(), 'artifacts/v5-localization');
const viewportWidths = [320, 390, 1440];

async function openTeacherDashboard(page: Page, language: 'vi' | 'en') {
  await page.addInitScript((selectedLanguage) => {
    localStorage.setItem('accessToken', 'playwright-teacher-only-token');
    localStorage.setItem('refreshToken', 'playwright-teacher-only-refresh-token');
    localStorage.setItem('language', selectedLanguage);
  }, language);
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const requestPath = url.pathname.replace(/\/api\/v1\/?/, '/');
    if (requestPath === '/auth/me' && route.request().method() === 'GET') {
      await route.fulfill({ json: { id: 'teacher-v5-fixture', username: 'teacher-v5', email: 'teacher@example.test', fullName: 'Test Teacher', role: 'User', imageUrl: null } });
      return;
    }
    if (requestPath === '/classes' && route.request().method() === 'GET') {
      await route.fulfill({ json: { items: [], pageNumber: 1, totalPages: 1, totalCount: 0, pageSize: 9, hasNextPage: false, hasPreviousPage: false } });
      return;
    }
    await route.fulfill({ status: 200, json: {} });
  });
  await page.goto('/teacher');
  await expect(page.getByRole('heading', { name: language === 'vi' ? 'Quản lý Lớp học' : 'Class Management' })).toBeVisible();
  const searchLabel = language === 'vi' ? 'Tìm kiếm lớp học theo tên hoặc mã...' : 'Search classes by name or code...';
  await expect(page.getByPlaceholder(searchLabel)).toBeVisible();
  await expect(page.getByRole('textbox', { name: searchLabel })).toBeVisible();
}

async function expectNoViewportOverflow(page: Page, width: number) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const size = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(size.viewport).toBe(width);
}

for (const language of ['vi', 'en'] as const) {
  for (const width of viewportWidths) {
    test(`Teacher V5 sorting and search copy is localized and fits at ${width}px (${language})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openTeacherDashboard(page, language);

      const copy = language === 'vi'
        ? { years: 'Tất cả các năm', newest: 'Mới nhất', most: 'Nhiều học sinh nhất', oldest: 'Cũ nhất' }
        : { years: 'All years', newest: 'Newest', most: 'Most students', oldest: 'Oldest' };
      const yearFilter = page.getByRole('button', { name: copy.years });
      const sortFilter = page.getByRole('button', { name: copy.newest, exact: true }).first();
      await expect(yearFilter).toBeVisible();
      await expect(sortFilter).toBeVisible();
      await sortFilter.click();
      await expect(page.getByRole('button', { name: copy.most, exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: copy.oldest, exact: true })).toBeVisible();
      await expectNoViewportOverflow(page, width);

      if ((language === 'vi' && width === 390) || (language === 'en' && width === 1440)) {
        await mkdir(artifactDirectory, { recursive: true });
        await page.screenshot({ path: path.join(artifactDirectory, `teacher-${language}-${width}px.png`), fullPage: true });
      }

      await sortFilter.press('Enter');
      const newestOption = page.getByRole('button', { name: copy.newest, exact: true }).last();
      await expect(newestOption).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(newestOption).toBeFocused();
      const focusVisible = await newestOption.evaluate((element) => element.matches(':focus-visible') && getComputedStyle(element).outlineStyle !== 'none');
      expect(focusVisible).toBe(true);
      await page.keyboard.press('Enter');
    });
  }
}

test('Admin management copy follows runtime language changes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openAdminUsers(page, 'en');

  await page.getByRole('button', { name: 'VN', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Người dùng', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Môn học', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Danh sách môn học' })).toBeVisible();

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Users', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('language'))).toBe('en');
});

for (const language of ['vi', 'en'] as const) {
  for (const width of viewportWidths) {
    test(`Admin V5 tabs and subject form are localized and fit at ${width}px (${language})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openAdminUsers(page, language);
      const subjectTabName = language === 'vi' ? 'Môn học' : 'Subjects';
      await page.getByRole('button', { name: subjectTabName, exact: true }).click();
      await expect(page.getByRole('heading', { name: language === 'vi' ? 'Danh sách môn học' : 'Subjects List' })).toBeVisible();
      await page.getByRole('button', { name: language === 'vi' ? 'Thêm môn học' : 'Add New Subject' }).click();

      const labels = language === 'vi'
        ? { name: 'Tên môn học', desc: 'Mô tả', placeholder: 'Ví dụ: Toán học', submit: 'Tạo môn học' }
        : { name: 'Subject Name', desc: 'Description', placeholder: 'e.g. Mathematics', submit: 'Create Subject' };
      await expect(page.getByLabel(labels.name)).toBeVisible();
      await expect(page.getByLabel(labels.desc)).toBeVisible();
      await expect(page.getByPlaceholder(labels.placeholder)).toBeVisible();
      const submit = page.getByRole('button', { name: labels.submit });
      await expect(submit).toBeVisible();
      await submit.focus();
      await expect(submit).toBeFocused();
      await expectNoViewportOverflow(page, width);

      if ((language === 'vi' && width === 320) || (language === 'en' && width === 1440)) {
        await mkdir(artifactDirectory, { recursive: true });
        await page.screenshot({ path: path.join(artifactDirectory, `admin-${language}-${width}px.png`), fullPage: true });
      }
    });
  }
}
