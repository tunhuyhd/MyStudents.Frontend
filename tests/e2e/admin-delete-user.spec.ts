import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import vi from '../../src/locales/vi.json';
import en from '../../src/locales/en.json';

for (const [width, language, copy] of [[1440, 'vi', vi], [390, 'en', en]] as const) {
  test(`admin account deletion requires confirmation and handles retry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(lang => localStorage.setItem('language', lang), language);
    const admin = { id: '99999999-9999-9999-9999-999999999999', username: 'admin', email: 'admin@example.test', fullName: 'Administrator', role: 'Admin' };
    const target = { id: '12345678-1234-1234-1234-123456789012', username: 'email-tester', email: 'teacher-email-verification@example.test', fullName: 'Test Teacher', roleName: 'User', roleId: 'user-role', status: 1 };
    let attempts = 0;
    await page.route('**/api/bff/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/auth/me')) return route.fulfill({ json: admin });
      if (path.endsWith('/admin/users')) return route.fulfill({ json: [{ ...admin, roleName: 'Admin', roleId: 'admin-role', status: 1 }, target] });
      if (path.endsWith('/admin/roles')) return route.fulfill({ json: [{ id: 'admin-role', name: 'Admin' }, { id: 'user-role', name: 'User' }] });
      if (path.endsWith('/admin/users/' + target.id) && route.request().method() === 'DELETE') {
        expect(route.request().postDataJSON()).toEqual({ confirmationEmail: target.email });
        attempts++;
        return attempts === 1 ? route.fulfill({ status: 503, json: {} }) : route.fulfill({ status: 204 });
      }
      return route.fulfill({ json: [] });
    });
    await page.goto('/admin');
    const open = page.getByRole('button', { name: copy.admin.deleteUserLabel.replace('{email}', target.email), exact: true });
    await open.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: copy.admin.cancel, exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: copy.admin.deleteUserAction, exact: true })).toBeDisabled();
    await dialog.getByLabel(copy.admin.deleteUserConfirmation).fill('wrong@example.test');
    await expect(dialog.getByRole('button', { name: copy.admin.deleteUserAction, exact: true })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(open).toBeFocused();
    expect(attempts).toBe(0);
    await open.click();
    await dialog.getByLabel(copy.admin.deleteUserConfirmation).fill(target.email);
    await mkdir('.impeccable/review', { recursive: true });
    await page.screenshot({ path: `.impeccable/review/admin-delete-user-${width}.png`, fullPage: true });
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await dialog.getByRole('button', { name: copy.admin.deleteUserAction, exact: true }).click();
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(open).toBeAttached();
    await dialog.getByRole('button', { name: copy.admin.deleteUserAction, exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(open).toHaveCount(0);
    await expect(page.getByText(copy.admin.deleteUserSuccess)).toBeVisible();
    await expect(page.getByText(copy.admin.protectedAccount, { exact: true })).toBeVisible();
    expect(attempts).toBe(2);
  });
}
