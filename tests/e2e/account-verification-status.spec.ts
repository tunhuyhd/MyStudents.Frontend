import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import vi from '../../src/locales/vi.json';
import en from '../../src/locales/en.json';

for (const [width, language, copy] of [[1440, 'vi', vi], [390, 'en', en]] as const) {
  test(`verification filters and duplicate email recovery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(lang => localStorage.setItem('language', lang), language);
    let adminSession = true;
    const pending = { id: 'pending-id', username: 'pending', email: 'pending@example.test', fullName: 'Pending Teacher', roleName: 'User', roleId: 'user-role', status: 1, isEmailVerified: false };
    await page.route('**/api/bff/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/auth/me')) return route.fulfill(adminSession ? { json: { id: 'admin-id', username: 'admin', role: 'Admin', email: 'admin@example.test', fullName: 'Admin' } } : { status: 401, json: {} });
      if (path.endsWith('/admin/users')) return route.fulfill({ json: [pending, { ...pending, id: 'verified-id', email: 'verified@example.test', isEmailVerified: true }] });
      if (path.endsWith('/admin/roles')) return route.fulfill({ json: [{ id: 'user-role', name: 'User' }] });
      if (path.endsWith('/auth/register')) return route.fulfill({ status: 409, json: { errorCode: 'ERR_EMAIL_EXISTS' } });
      return route.fulfill({ json: [] });
    });
    await page.goto('/admin');
    const filter = page.getByLabel(copy.admin.emailVerification, { exact: true });
    await expect(page.getByText(pending.email, { exact: true })).toBeVisible();
    await filter.selectOption('pending');
    await expect(page.getByText('verified@example.test', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('cell', { name: copy.admin.emailPending, exact: false })).toBeVisible();
    await mkdir('.impeccable/review', { recursive: true });
    await page.screenshot({ path: `.impeccable/review/verification-filter-${width}.png`, fullPage: true });
    await filter.selectOption('verified');
    await expect(page.getByText(pending.email, { exact: true })).toHaveCount(0);
    await expect(page.getByText('verified@example.test', { exact: true })).toBeVisible();
    await filter.selectOption('all');
    await expect(page.getByText(pending.email, { exact: true })).toBeVisible();
    adminSession = false;
    await page.goto('/auth/register');
    await page.getByLabel(copy.auth.fullName, { exact: true }).fill('Pending Teacher');
    await page.getByLabel(copy.auth.username, { exact: true }).fill('new-username');
    await page.getByLabel(copy.auth.email, { exact: true }).fill(pending.email);
    await page.getByLabel(copy.auth.password, { exact: true }).fill('Test-password!42');
    await page.getByRole('button', { name: copy.common.register, exact: true }).click();
    const recovery = page.getByRole('alert').filter({ hasText: copy.auth.emailAlreadyRegistered });
    await expect(recovery).toContainText(copy.auth.emailAlreadyRegistered);
    await expect(recovery.getByRole('link', { name: copy.common.login, exact: true })).toHaveAttribute('href', '/auth/login');
    await expect(recovery.getByRole('link', { name: copy.auth.verificationResend })).toHaveAttribute('href', '/auth/verify-email');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/duplicate-email-${width}.png`, fullPage: true });
    await recovery.getByRole('link', { name: copy.auth.verificationResend }).click();
    await expect(page.getByLabel(copy.auth.email, { exact: true })).toBeVisible();
  });
}
