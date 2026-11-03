import { expect, test, type Locator } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import vi from '../../src/locales/vi.json';
import en from '../../src/locales/en.json';

// Explicit authoring command only. Normal CI must not rewrite committed assets.
test.skip(process.env.CAPTURE_HANDBOOK !== '1', 'Set CAPTURE_HANDBOOK=1 to regenerate handbook screenshots.');

for (const language of ['vi', 'en'] as const) test(`capture handbook examples ${language}`, async ({ page, context, baseURL }) => {
  test.setTimeout(120_000);
  const copy = language === 'vi' ? vi : en;
  await page.setViewportSize({ width: 1360, height: 960 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(lang => localStorage.setItem('language', lang), language);
  await context.route('**/*', route => new URL(route.request().url()).origin !== new URL(baseURL!).origin
    ? route.abort() : route.continue());
  const students = ['Minh An', 'Hà Linh', 'Gia Bảo'].map((firstName, i) => ({
    id: `demo-student-${i}`, firstName, lastName: 'Nguyễn', fullName: `Nguyễn ${firstName}`,
    email: `student${i + 1}@example.test`, phone: '', gender: 0, status: 1, joinedAt: '2030-01-01T00:00:00Z', createdOn: '2030-01-01T00:00:00Z',
  }));
  const sessions = [6, 8, 13].map((day, i) => ({ id: `demo-session-${i}`, date: `2030-01-${day.toString().padStart(2, '0')}`,
    startTime: '17:30:00', endTime: '19:00:00', status: 1, orderIndex: i + 1, presentCount: 0, totalCount: 3, note: '' }));
  const course = { id: 'demo-class', name: language === 'vi' ? 'Toán lớp 9' : 'Grade 9 Mathematics', code: 'TOAN-09',
    subjectId: 'demo-math', subjectName: language === 'vi' ? 'Toán học' : 'Mathematics', category: 1, status: 1,
    startDate: '2030-01-01', expectedEndDate: '2030-05-31', studentCount: 3,
    schedules: [{ id: 'demo-schedule', dayOfWeek: 1, startTime: '17:30:00', durationHours: 1.5 }], sessions };
  const paged = (items: unknown[]) => ({ items, totalCount: items.length, totalPages: 1, pageNumber: 1, pageSize: 12 });
  await page.route('**/api/bff/**', route => {
    const path = new URL(route.request().url()).pathname.replace('/api/bff', '');
    if (path === '/auth/me') return route.fulfill({ json: { id: 'demo-teacher', username: 'teacher_demo',
      fullName: language === 'vi' ? 'Giáo viên minh họa' : 'Demo Teacher', email: 'teacher@example.test', role: 'User' } });
    if (path === '/subjects') return route.fulfill({ json: [{ id: 'demo-math', name: course.subjectName }] });
    if (path === '/classes') return route.fulfill({ json: paged([course]) });
    if (path === '/students/paged') return route.fulfill({ json: paged(students) });
    if (path.endsWith('/available-students')) return route.fulfill({ json: students });
    if (path.endsWith('/students')) return route.fulfill({ json: paged(students) });
    if (path === '/classes/demo-class') return route.fulfill({ json: course });
    if (path === '/sessions' && route.request().method() === 'POST') return route.fulfill({ json: 'demo-session-0' });
    if (path.endsWith('/attendances')) return route.fulfill({ json: students.map((s, i) => ({
      id: `demo-attendance-${i}`, studentId: s.id, studentName: s.fullName, studentEmail: s.email, status: [1, 2, 0][i],
    })) });
    if (path.startsWith('/sessions/')) return route.fulfill({ json: sessions[0] });
    return route.fulfill({ json: [] });
  });
  const folder = `public/handbook/${language}`;
  await mkdir(folder, { recursive: true });
  const manifest: unknown[] = [];

  async function capture(name: string, root: Locator, targets: Locator[]) {
    await expect(root).toBeVisible();
    for (const target of targets) await expect(target).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'nextjs-portal { display:none!important; }' });
    const bounds = await root.boundingBox();
    if (!bounds) throw new Error(`Missing screenshot bounds: ${name}`);
    // Markers are rendered by the browser over real UI before capture, not painted onto invented mockups.
    const markers = await Promise.all(targets.map(async (target, index) => ({ index: index + 1, box: (await target.boundingBox())! })));
    await page.evaluate(items => {
      const layer = document.createElement('div'); layer.id = 'handbook-capture-markers';
      layer.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none';
      for (const { index, box } of items) {
        const pin = document.createElement('span'); pin.textContent = String(index);
        pin.style.cssText = `position:fixed;left:${Math.max(4, box.x - 34)}px;top:${Math.max(4, box.y + Math.min(box.height, 44) / 2 - 15)}px;width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#075e4c;color:white;border:2px solid white;font:700 16px/1 Arial;box-shadow:0 2px 8px #09282830`;
        layer.append(pin);
      }
      document.body.append(layer);
    }, markers);
    const clip = { x: Math.max(0, bounds.x - 16), y: Math.max(0, bounds.y - 16),
      width: Math.min(bounds.width + 32, 1360 - Math.max(0, bounds.x - 16)),
      height: Math.min(bounds.height + 32, 960 - Math.max(0, bounds.y - 16)) };
    await page.screenshot({ path: `${folder}/${name}.jpg`, type: 'jpeg', quality: 85, clip, animations: 'disabled' });
    await page.locator('#handbook-capture-markers').evaluate(el => el.remove());
    manifest.push({ file: `${name}.jpg`, origin: `Local MyStudents UI ${page.url().replace(baseURL!, '')}; synthetic fixtures; ${language}; numbered browser overlays`,
      dimensions: [Math.floor(clip.width), Math.floor(clip.height)], targets: markers.map(m => m.index) });
  }

  await page.goto('/auth/login');
  await capture('account', page.locator('.club-auth-form'), [page.getByLabel(copy.auth.username, { exact: true }),
    page.getByRole('link', { name: copy.auth.forgotPassword }), page.getByRole('link', { name: copy.auth.createAccount })]);

  await page.goto('/teacher/students');
  await expect(page.locator('.campus-record')).toHaveCount(3);
  await capture('students', page.locator('#teacher-content'), [page.getByRole('button', { name: copy.teacher.students.addBtn, exact: true }),
    page.getByRole('textbox', { name: copy.teacher.students.searchLabel }), page.locator('.campus-record').first().getByRole('button').first()]);

  await page.goto('/teacher');
  await expect(page.locator('.club-class-card')).toHaveCount(1);
  await capture('classes', page.locator('#teacher-content'), [page.getByRole('button', { name: copy.club.createClass, exact: true }),
    page.locator('.club-filter-bar'), page.locator('.club-more')]);
  await page.getByRole('button', { name: copy.club.createClass, exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel(copy.teacher.modal.nameLabel, { exact: true }).fill(course.name);
  await dialog.getByLabel(copy.teacher.modal.codeLabel, { exact: true }).fill(course.code);
  await capture('class-details', dialog, [dialog.getByLabel(copy.teacher.modal.nameLabel, { exact: true }),
    dialog.getByLabel(copy.teacher.modal.codeLabel, { exact: true }), dialog.getByRole('button', { name: copy.teacher.modal.continue, exact: true })]);
  await dialog.getByRole('button', { name: copy.teacher.modal.continue, exact: true }).click();
  await capture('class-schedule', dialog, [dialog.getByRole('group', { name: copy.teacher.modal.startDateLabel, exact: true }), dialog.locator('.club-schedule-row').first(),
    dialog.locator('.club-modal-footer').getByRole('button').last()]);
  page.on('dialog', d => d.accept());
  await dialog.getByRole('button', { name: copy.common.close, exact: true }).click();

  await page.goto('/teacher/class/demo-class');
  await page.getByRole('button', { name: copy.teacher.details.students, exact: true }).click();
  await page.getByRole('button', { name: copy.teacher.details.addStudent, exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByText('student1@example.test')).toBeVisible();
  await capture('enrollment', dialog, [dialog.getByRole('textbox'), dialog.getByText(students[0].fullName, { exact: true })]);
  await dialog.getByRole('button', { name: copy.common.close, exact: true }).click();
  await page.getByRole('button', { name: copy.teacher.details.sessions, exact: true }).click();
  await expect(page.getByText('17:30 - 19:00').first()).toBeVisible();
  await capture('schedule', page.locator('#teacher-content'), [page.getByRole('button', { name: copy.teacher.details.sessions, exact: true }),
    page.getByRole('button', { name: copy.teacher.details.recordSession, exact: true }), page.getByText('17:30 - 19:00').first()]);
  await page.getByRole('button', { name: copy.teacher.details.recordSession, exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Tiếp tục điểm danh', exact: true }).click();
  await expect(dialog.getByText(students[0].fullName, { exact: true })).toBeVisible();
  await capture('attendance', dialog, [dialog.getByText(students[0].fullName, { exact: true }),
    dialog.locator('.club-modal-content button').first(), dialog.locator('.club-modal-footer').getByRole('button').last()]);
  await dialog.getByRole('button', { name: copy.common.close, exact: true }).click();

  await page.goto('/me');
  await expect(page.getByLabel(copy.auth.fullName, { exact: true })).toBeVisible();
  await capture('profile', page.locator('main'), [page.getByRole('button', { name: copy.profile.chooseNewPhoto, exact: true }),
    page.getByLabel(copy.auth.fullName, { exact: true }), page.getByRole('button', { name: copy.common.save, exact: true })]);
  await page.getByRole('button', { name: copy.profile.security, exact: true }).click();
  await capture('security', page.locator('main'), [page.locator('.club-profile-nav').getByRole('button', { name: copy.profile.security, exact: true }),
    page.getByLabel(copy.profile.oldPassword, { exact: true }), page.getByRole('button', { name: copy.profile.changePassword, exact: true })]);
  await writeFile(`${folder}/provenance.json`, JSON.stringify(manifest, null, 2));
});
