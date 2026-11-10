import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import vi from '../../src/locales/vi.json';
import en from '../../src/locales/en.json';

for (const [width, language, copy] of [[1440, 'vi', vi], [390, 'en', en]] as const) {
  test(`teacher overview data, retry, empty and attendance at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(lang => localStorage.setItem('language', lang), language);
    let state: 'data' | 'error' | 'empty' = 'data';
    let attendanceRead = false;
    const session = { id: 'session-id', classId: 'class-id', className: 'Toán lớp 10 · Algebra', date: '2026-11-10', startTime: '08:00:00', endTime: '10:00:00', status: 1, studentCount: 12, pendingAttendanceCount: 2 };
    await page.route('**/api/bff/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/auth/me')) return route.fulfill({ json: { id: 'teacher', username: 'teacher', fullName: 'Test Teacher', role: 'User', email: 'teacher@example.test' } });
      if (path.endsWith('/classes/dashboard')) {
        if (state === 'error') return route.fulfill({ status: 503, json: {} });
        return route.fulfill({ json: { today: '2026-11-10', generatedAt: '2026-11-10T04:00:00Z', activeClassCount: state === 'empty' ? 0 : 25, activeStudentCount: state === 'empty' ? 0 : 112, pendingSessionCount: state === 'empty' ? 0 : 1, upcomingSessionCount: state === 'empty' ? 0 : 1, todaySessions: state === 'empty' ? [] : [session], pendingSessions: state === 'empty' ? [] : [session], upcomingSessions: state === 'empty' ? [] : [{ ...session, id: 'next-id', date: '2026-11-11' }] } });
      }
      if (path.endsWith('/sessions/session-id/attendances')) { attendanceRead = true; return route.fulfill({ json: [] }); }
      if (path.endsWith('/sessions/session-id')) return route.fulfill({ json: session });
      return route.fulfill({ json: [] });
    });
    await page.goto('/teacher/overview');
    await expect(page.getByRole('heading', { name: copy.overview.title })).toBeVisible();
    await expect(page.getByText(copy.overview.activeClasses.replace('{count}', '25'), { exact: true })).toBeVisible();
    await expect(page.getByText(copy.overview.activeStudents.replace('{count}', '112'), { exact: true })).toBeVisible();
    await expect(page.getByText(copy.overview.pendingTotal.replace('{count}', '1'), { exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: copy.overview.pending }).getByText(copy.overview.shown.replace('{count}', '1').replace('{total}', '1'), { exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: copy.overview.today }).getByText(copy.overview.pendingCount.replace('{count}', '2'), { exact: false })).toBeVisible();
    await expect(page.getByRole('region', { name: copy.overview.today }).getByRole('link', { name: copy.overview.viewClass })).toHaveAttribute('href', '/teacher/class/class-id');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await mkdir('.impeccable/review', { recursive: true });
    await page.screenshot({ path: `.impeccable/review/teacher-overview-${width}.png`, fullPage: true });
    state = 'error';
    await page.getByRole('button', { name: copy.admin.refresh, exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: copy.overview.loadError })).toBeVisible();
    await expect(page.getByText(session.className, { exact: true }).first()).toBeVisible();
    state = 'empty';
    await page.getByRole('button', { name: copy.common.retry, exact: true }).click();
    await expect(page.getByText(copy.overview.todayEmpty)).toBeVisible();
    await expect(page.getByText(copy.overview.pendingEmpty)).toBeVisible();
    await expect(page.getByText(copy.overview.upcomingEmpty)).toBeVisible();
    state = 'data';
    await page.getByRole('button', { name: copy.admin.refresh, exact: true }).click();
    await page.getByRole('button', { name: copy.overview.attendance, exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => attendanceRead).toBe(true);
  });
}
