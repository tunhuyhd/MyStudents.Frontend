import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('Google actions fit login and registration and explain failure without redirecting', async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, 'Requires a test Google Client ID in the local test server environment');
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('language', 'vi'));
  await page.route('https://accounts.google.com/gsi/client*', route => route.fulfill({
    contentType: 'application/javascript', body: `window.google={accounts:{id:{initialize:function(o){window.googleCallback=o.callback},renderButton:function(el,o){var b=document.createElement('button');b.textContent='Tiếp tục với Google';b.style.cssText='height:44px;border:1px solid #ddd;border-radius:24px;background:white;padding:0 28px;max-width:100%';b.onclick=function(){window.googleCallback({credential:'test-only'})};el.appendChild(b)}}}};`
  }));
  await page.route('**/api/bff/**', route => {
    const url = new URL(route.request().url());
    return url.pathname.endsWith('/auth/google')
      ? route.fulfill({ status: 409, json: { errorCode: 'ERR_GOOGLE_ACCOUNT_EXISTS' } })
      : route.fulfill({ status: 401, json: {} });
  });
  await mkdir('.impeccable/review', { recursive: true });
  for (const path of ['login', 'register']) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/auth/' + path);
      await page.getByRole('button', { name: 'Tiếp tục với Google' }).click();
      await expect(page.getByRole('alert').filter({ hasText: 'Email này đã có tài khoản' })).toContainText('Email này đã có tài khoản');
      await expect(page).toHaveURL(new RegExp('/auth/' + path + '$'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: '.impeccable/review/google-' + path + '-' + width + '.png', fullPage: true });
    }
  }
  expect(pageErrors).toEqual([]);
});
