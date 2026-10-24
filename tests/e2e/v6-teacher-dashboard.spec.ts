import { expect, test, type Page, type Route } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Language = 'vi' | 'en';
type DashboardState = 'populated' | 'empty' | 'loading' | 'error';

const stage = process.env.V6_CAPTURE_STAGE ?? 'verification';
const artifactDirectory = path.resolve(process.cwd(), 'artifacts/v6-teacher-dashboard', stage);
const names = {
  vi: {
    title: 'Quản lý Lớp học',
    metric: 'Lượt ghi danh trên trang này',
    create: 'Tạo lớp học mới',
    empty: 'Bạn chưa có lớp học nào. Hãy tạo lớp học đầu tiên!',
    retry: 'Thử lại',
    view: 'Xem chi tiết',
    edit: 'Edit',
    delete: 'Delete',
  },
  en: {
    title: 'Class Management',
    metric: 'Enrollments on this page',
    create: 'Create New Class',
    empty: "You don't have any classes yet. Create your first one!",
    retry: 'Try again',
    view: 'View Details',
    edit: 'Edit',
    delete: 'Delete',
  },
} satisfies Record<Language, Record<string, string>>;

const classes = [
  { id: 'class-1', name: 'Algebra foundations', code: 'ALG-01', status: 1, category: 1, subjectId: 'math', subjectName: 'Mathematics', studentCount: 12, startDate: '2026-08-25T00:00:00Z', expectedEndDate: '2026-12-20T00:00:00Z', schedules: [{ id: 's1', dayOfWeek: 1, startTime: '09:00:00', durationHours: 1.5 }] },
  { id: 'class-2', name: 'Luyện thi Toán nâng cao dành cho học sinh cuối cấp', code: 'MAT-ADV', status: 2, category: 0, subjectId: 'math', subjectName: 'Toán học', studentCount: 8, startDate: '2026-09-02T00:00:00Z', expectedEndDate: '2027-01-20T00:00:00Z', schedules: [{ id: 's2', dayOfWeek: 3, startTime: '14:30:00', durationHours: 2 }] },
  { id: 'class-3', name: 'English conversation practice for advanced learners', code: 'ENG-03', status: 3, category: 1, subjectId: 'eng', subjectName: 'English', studentCount: 4, startDate: '2026-07-01T00:00:00Z', expectedEndDate: '2026-10-01T00:00:00Z', schedules: [] },
  { id: 'class-4', name: 'Chemistry', code: 'CHEM-04', status: 1, category: 0, subjectId: 'chem', subjectName: 'Chemistry', studentCount: 16, startDate: '2026-10-01T00:00:00Z', expectedEndDate: '2027-02-01T00:00:00Z', schedules: [{ id: 's4', dayOfWeek: 5, startTime: '18:00:00', durationHours: 1 }] },
  { id: 'class-5', name: 'Physics lab', code: 'PHY-05', status: 4, category: 1, subjectId: 'physics', subjectName: 'Physics', studentCount: 0, startDate: '2026-06-15T00:00:00Z', expectedEndDate: '2026-09-15T00:00:00Z', schedules: [] },
  { id: 'class-6', name: 'Lớp phụ đạo cuối tuần', code: 'WEEKEND-06', status: 1, category: 0, subjectId: 'math', subjectName: 'Toán học', studentCount: 5, startDate: '2026-10-10T00:00:00Z', expectedEndDate: '2027-03-10T00:00:00Z', schedules: [{ id: 's6', dayOfWeek: 6, startTime: '10:00:00', durationHours: 1.5 }] },
];

async function setupDashboard(page: Page, language: Language, state: DashboardState) {
  let releaseClassResponse: (() => void) | undefined;
  const classResponseGate = new Promise<void>((resolve) => { releaseClassResponse = resolve; });

  await page.addInitScript((selectedLanguage) => {
    localStorage.setItem('accessToken', 'playwright-v6-teacher-token');
    localStorage.setItem('refreshToken', 'playwright-v6-teacher-refresh-token');
    localStorage.setItem('language', selectedLanguage);
  }, language);
  await page.route('**/api/v1/**', async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const requestPath = url.pathname.replace(/\/api\/v1\/?/, '/');
    if (requestPath === '/auth/me' && request.method() === 'GET') {
      await route.fulfill({ json: { id: 'teacher-v6-fixture', username: 'teacher-v6', email: 'teacher@example.test', fullName: 'Test Teacher', role: 'User', imageUrl: null } });
      return;
    }
    if (requestPath === '/classes' && request.method() === 'GET') {
      if (state === 'loading') await classResponseGate;
      if (state === 'error') {
        await route.fulfill({ status: 503, json: { message: 'Temporary fixture outage' } });
        return;
      }
      await route.fulfill({ json: {
        items: state === 'populated' ? classes : [],
        pageNumber: 1,
        totalPages: 1,
        totalCount: state === 'populated' ? classes.length : 0,
        pageSize: 9,
        hasNextPage: false,
        hasPreviousPage: false,
      } });
      return;
    }
    await route.fulfill({ status: 200, json: {} });
  });

  await page.goto('/teacher');
  await expect(page.getByRole('heading', { level: 1, name: names[language].title })).toBeVisible();
  return { releaseClassResponse: () => releaseClassResponse?.() };
}

async function recordLayout(page: Page, width: number, language: Language, state: DashboardState) {
  const measurements = await page.evaluate(({ viewportWidth, currentLanguage, currentState }) => {
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        top: Math.round(box.top + window.scrollY), left: Math.round(box.left), width: Math.round(box.width), height: Math.round(box.height),
        padding: style.padding, marginBottom: style.marginBottom, borderRadius: style.borderRadius, fontSize: style.fontSize,
      };
    };
    const headings = Array.from(document.querySelectorAll<HTMLElement>('main h3'));
    const alert = document.querySelector<HTMLElement>('main [role="alert"]');
    const cardGeometry = headings.filter((heading) => heading.closest('.group')).map((heading) => {
      const card = heading.closest<HTMLElement>('.group')!;
      const badges = card.firstElementChild as HTMLElement | null;
      const titleBox = heading.getBoundingClientRect();
      const badgeBox = badges?.getBoundingClientRect();
      const intersects = Boolean(badgeBox && titleBox.left < badgeBox.right && titleBox.right > badgeBox.left && titleBox.top < badgeBox.bottom && titleBox.bottom > badgeBox.top);
      return {
        title: heading.textContent?.trim(),
        titleTop: Math.round(titleBox.top),
        titleHeight: Math.round(titleBox.height),
        badgeBottom: badgeBox ? Math.round(badgeBox.bottom) : null,
        titleBadgeOverlap: intersects,
      };
    });
    const emptyHeading = headings.find((heading) => !heading.closest('.group'));
    const emptyPanelElement = emptyHeading?.closest<HTMLElement>('[class*="col-span-full"]') ?? null;
    const emptyPanelBox = emptyPanelElement?.getBoundingClientRect();
    return {
      viewport: { requestedCssWidth: viewportWidth, innerWidth: window.innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, scrollHeight: document.documentElement.scrollHeight, horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth },
      language: currentLanguage,
      state: currentState,
      heading: rect('main h1'),
      summary: rect('main .flex.bg-white.border.border-surface-100'),
      primaryAction: rect('main button.bg-brand-action'),
      filters: rect('main [class*="bg-white/60"][class*="backdrop-blur-md"]'),
      cardCount: headings.length,
      cardGeometry,
      firstCardHeading: headings[0] ? (() => { const box = headings[0].getBoundingClientRect(); return { top: Math.round(box.top + window.scrollY), left: Math.round(box.left), width: Math.round(box.width), height: Math.round(box.height), text: headings[0].textContent }; })() : null,
      visibleCardActions: Array.from(document.querySelectorAll<HTMLElement>('main button')).filter((element) => element.getClientRects().length > 0 && Boolean(element.closest('.group'))).length,
      emptyState: rect('main h3'),
      emptyPanel: emptyPanelBox ? { top: Math.round(emptyPanelBox.top + window.scrollY), width: Math.round(emptyPanelBox.width), height: Math.round(emptyPanelBox.height), padding: getComputedStyle(emptyPanelElement!).padding, borderRadius: getComputedStyle(emptyPanelElement!).borderRadius } : null,
      error: alert ? { visible: Boolean(alert.getClientRects().length), height: Math.round(alert.getBoundingClientRect().height) } : null,
      loadingSkeletons: document.querySelectorAll('main div.h-72.animate-pulse').length,
      focusVisible: document.activeElement instanceof HTMLElement && document.activeElement.matches(':focus-visible'),
    };
  }, { viewportWidth: width, currentLanguage: language, currentState: state });
  return measurements;
}

async function capture(page: Page, width: number, language: Language, state: DashboardState, focusedControls: unknown[] = []) {
  await mkdir(artifactDirectory, { recursive: true });
  const stem = `teacher-${state}-${language}-${width}px`;
  const screenshotPath = path.join(artifactDirectory, `${stem}.png`);
  // Keep full-page screenshots anchored at the page top after keyboard focus checks.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  await page.waitForTimeout(650);
  const measurements = await recordLayout(page, width, language, state);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const measurementPath = path.join(artifactDirectory, `${stem}.json`);
  await writeFile(measurementPath, JSON.stringify({ stage, generatedAt: new Date().toISOString(), screenshotPath, focusedControls, ...measurements }, null, 2), 'utf8');
  await test.info().attach(`${stem}.json`, { body: JSON.stringify({ screenshotPath, focusedControls, ...measurements }, null, 2), contentType: 'application/json' });
  return measurements;
}

async function focusByKeyboard(page: Page, control: import('@playwright/test').Locator) {
  let focused = await control.evaluate((element) => element === document.activeElement);
  for (let attempt = 0; attempt < 70 && !focused; attempt += 1) {
    await page.keyboard.press('Tab');
    focused = await control.evaluate((element) => element === document.activeElement);
  }
  await expect(control).toBeFocused();
  const indicator = await control.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      focusVisible: element.matches(':focus-visible'),
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      outlineColor: style.outlineColor,
    };
  });
  expect(indicator.focusVisible).toBe(true);
  expect(indicator.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(indicator.outlineWidth)).toBeGreaterThanOrEqual(2);
  return indicator;
}

for (const width of [390, 1440]) {
  for (const language of ['vi', 'en'] as const) {
    for (const state of ['populated', 'empty', 'loading', 'error'] as const) {
      test(`Teacher dashboard ${state} layout at ${width}px (${language})`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const fixture = await setupDashboard(page, language, state);
        const focusedControls: Array<{ name: string; focusVisible: boolean; outlineStyle: string; outlineWidth: string; outlineColor: string }> = [];
        if (state === 'populated') {
          await expect(page.getByRole('heading', { name: classes[1].name })).toBeVisible();
          const create = page.getByRole('button', { name: names[language].create }).first();
          const view = page.getByRole('button', { name: names[language].view }).first();
          await expect(create).toBeVisible();
          await expect(view).toBeVisible();
          focusedControls.push({ name: 'create-class', ...(await focusByKeyboard(page, create)) });
          focusedControls.push({ name: 'view-class', ...(await focusByKeyboard(page, view)) });
          const card = page.getByRole('heading', { name: classes[1].name }).locator('xpath=ancestor::div[contains(@class,"bg-white/80")][1]');
          const edit = card.getByRole('button').nth(1);
          const remove = card.getByRole('button').nth(2);
          await expect(edit).toBeVisible();
          await expect(remove).toBeVisible();
          focusedControls.push({ name: 'edit-class', ...(await focusByKeyboard(page, edit)) });
          focusedControls.push({ name: 'delete-class', ...(await focusByKeyboard(page, remove)) });
        } else if (state === 'empty') {
          await expect(page.getByRole('heading', { name: names[language].empty })).toBeVisible();
          const create = page.getByRole('button', { name: names[language].create }).last();
          await expect(create).toBeVisible();
          focusedControls.push({ name: 'create-class', ...(await focusByKeyboard(page, create)) });
        } else if (state === 'loading') {
          await expect(page.locator('main div.h-72.animate-pulse')).toHaveCount(3);
          const create = page.getByRole('button', { name: names[language].create }).first();
          focusedControls.push({ name: 'create-class', ...(await focusByKeyboard(page, create)) });
        } else {
          await expect(page.locator('main [role="alert"]')).toBeVisible();
          const retry = page.getByRole('button', { name: names[language].retry });
          await expect(retry).toBeVisible();
          focusedControls.push({ name: 'retry-load', ...(await focusByKeyboard(page, retry)) });
        }
        const measurements = await capture(page, width, language, state, focusedControls);
        expect(measurements.viewport.documentWidth).toBeLessThanOrEqual(width);
        if (state === 'populated') expect(measurements.cardCount).toBe(classes.length);
        if (state === 'populated' && stage !== 'before') expect(measurements.cardGeometry.every((card) => !card.titleBadgeOverlap)).toBe(true);
        if (state === 'loading') fixture.releaseClassResponse();
      });
    }
  }
}

for (const width of [320, 768]) {
  for (const state of ['populated', 'empty'] as const) {
    test(`Teacher dashboard ${state} state fits at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const language: Language = width === 320 ? 'vi' : 'en';
      await setupDashboard(page, language, state);
      if (state === 'populated') await expect(page.getByRole('heading', { name: classes[1].name })).toBeVisible();
      else await expect(page.getByRole('heading', { name: names[language].empty })).toBeVisible();
      const primaryAction = page.getByRole('button', { name: names[language].create }).nth(state === 'populated' ? 0 : 1);
      const focusedControls = [{ name: 'create-class', ...(await focusByKeyboard(page, primaryAction)) }];
      const measurement = await capture(page, width, language, state, focusedControls);
      expect(measurement.viewport.documentWidth).toBeLessThanOrEqual(width);
      if (state === 'populated' && stage !== 'before') expect(measurement.cardGeometry.every((card) => !card.titleBadgeOverlap)).toBe(true);
    });
  }
}
