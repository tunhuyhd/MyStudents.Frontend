import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import vi from '../../src/locales/vi.json';
import en from '../../src/locales/en.json';

for (const [width, language, copy] of [[1440, 'vi', vi], [390, 'en', en]] as const) {
  test(`email verification and fixed profile email at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(lang => localStorage.setItem('language', lang), language);
    let verifies = 0;
    let loggedIn = false;
    await page.route('**/api/bff/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/auth/me')) return route.fulfill(loggedIn ? { json: { id: 'teacher-id', username: 'teacher', email: 'teacher@example.test', fullName: 'Test Teacher', role: 'User', imageUrl: null } } : { status: 401, json: {} });
      if (path.endsWith('/auth/register')) return route.fulfill({ status: 202, json: { requiresEmailVerification: true } });
      if (path.endsWith('/auth/verify-email')) {
        verifies++;
        expect(route.request().postDataJSON().token).toBe('A'.repeat(64));
        return route.fulfill({ status: 204 });
      }
      if (path.endsWith('/auth/resend-verification')) return route.fulfill({ status: 202, json: {} });
      return route.fulfill({ json: [] });
    });
    await page.goto('/auth/register');
    await page.getByLabel(copy.auth.fullName, { exact: true }).fill('Test Teacher');
    await page.getByLabel(copy.auth.username, { exact: true }).fill('teacher');
    await page.getByLabel(copy.auth.email, { exact: true }).fill('teacher@example.test');
    await page.getByLabel(copy.auth.password, { exact: true }).fill('Test-password!42');
    await page.getByRole('button', { name: copy.common.register, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(copy.auth.verificationRegistrationSent);
    await expect(page).toHaveURL(/\/auth\/register$/);
    await mkdir('.impeccable/review', { recursive: true });
    await page.screenshot({ path: `.impeccable/review/email-registration-${width}.png`, fullPage: true });

    await page.goto('/auth/verify-email#token=' + 'A'.repeat(64));
    await expect(page.getByRole('button', { name: copy.auth.verificationConfirm, exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/verify-email$/);
    expect(verifies).toBe(0);
    await page.getByRole('button', { name: copy.auth.verificationConfirm, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(copy.auth.verificationSuccess);
    expect(verifies).toBe(1);

    await page.goto('/auth/verify-email#token=invalid');
    await expect(page.getByRole('alert').filter({ hasText: copy.errors.ERR_INVALID_VERIFICATION_TOKEN })).toBeVisible();
    await page.getByLabel(copy.auth.email, { exact: true }).fill('teacher@example.test');
    await page.getByRole('button', { name: copy.auth.verificationResend, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(copy.auth.verificationResent);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/email-verification-${width}.png`, fullPage: true });

    loggedIn = true;
    await page.goto('/me');
    await expect(page.getByLabel(copy.auth.email, { exact: true })).toHaveAttribute('readonly', '');
    await expect(page.getByText(copy.profile.emailLocked)).toBeVisible();
  });
}
