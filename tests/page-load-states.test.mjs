import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { classifyLoadFailure, getListLoadState, isRetryableLoadFailure } = require('../.test-output/loadFailure.js');
const teacher = readFileSync(new URL('../src/app/teacher/page.tsx', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../src/app/admin/page.tsx', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../src/app/teacher/class/[id]/page.tsx', import.meta.url), 'utf8');
const english = JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url), 'utf8'));
const vietnamese = JSON.parse(readFileSync(new URL('../src/locales/vi.json', import.meta.url), 'utf8'));

test('successful list responses distinguish empty and populated states from loading', () => {
  assert.equal(getListLoadState([], true, null), 'loading');
  assert.equal(getListLoadState([], false, null), 'empty');
  assert.equal(getListLoadState([{ id: 'example' }], false, null), 'data');
});

test('timeouts and server failures are retryable while 401 and 403 are authorization states', () => {
  const timeout = { code: 'ECONNABORTED', message: 'timeout' };
  const serverError = { response: { status: 503 } };
  const unauthorized = { response: { status: 401 } };
  const forbidden = { response: { status: 403 } };

  assert.equal(classifyLoadFailure(timeout), 'failed');
  assert.equal(isRetryableLoadFailure(classifyLoadFailure(timeout)), true);
  assert.equal(classifyLoadFailure(serverError), 'failed');
  assert.equal(isRetryableLoadFailure(classifyLoadFailure(serverError)), true);
  assert.equal(classifyLoadFailure(unauthorized), 'unauthorized');
  assert.equal(isRetryableLoadFailure(classifyLoadFailure(unauthorized)), false);
  assert.equal(classifyLoadFailure(forbidden), 'forbidden');
  assert.equal(isRetryableLoadFailure(classifyLoadFailure(forbidden)), false);
});

test('teacher dashboard shows a real empty state only after success and retries the same class query', () => {
  assert.match(teacher, /setClasses\(res\.data\.items\)/);
  assert.match(teacher, /classesLoadState === 'loading'/);
  assert.match(teacher, /classesLoadFailure \? null/);
  assert.match(teacher, /onClick=\{\(\) => \{ void fetchClasses\(\); \}\}/);
  assert.match(teacher, /classifyLoadFailure\(err\)/);
  assert.match(teacher, /searchTerm, year, sortBy, sortDescending, pageNumber, pageSize/);
});

test('admin users and roles load, fail and retry independently', () => {
  assert.match(admin, /api\.get<UserDto\[]>\('\/admin\/users'\)/);
  assert.match(admin, /api\.get<RoleDto\[]>\('\/admin\/roles'\)/);
  assert.match(admin, /Promise\.all\(\[fetchUsers\(\), fetchRoles\(\)\]\)/);
  assert.match(admin, /onClick=\{\(\) => \{ void fetchUsers\(\); \}\}/);
  assert.match(admin, /onClick=\{\(\) => \{ void fetchRoles\(\); \}\}/);
  assert.match(admin, /usersLoadState === 'empty'/);
  assert.match(admin, /rolesLoadState === 'empty'/);
  assert.match(admin, /usersLoadFailure && \(users\.length > 0 \|\| usersLoadFailure !== 'failed'\)/);
  assert.match(admin, /rolesLoadFailure && rolesLoadFailure !== 'failed' \? \[\] : roles/);
});

test('class detail and student requests retain loaded values on network failure and expose scoped retry', () => {
  assert.match(detail, /setClassData\(normalizedData\)/);
  assert.match(detail, /onClick=\{\(\) => \{ void fetchClassDetail\(\); \}\}/);
  assert.match(detail, /setStudents\(normalizedStudents\)/);
  assert.match(detail, /onClick=\{\(\) => \{ void fetchClassStudents\(pageNumber\); \}\}/);
  assert.match(detail, /studentsLoadState === 'loading'/);
  assert.match(detail, /studentsLoadFailure \? \(/);
  assert.match(detail, /classifyLoadFailure\(error\)/);
});

test('load failures and retry labels are localized in both supported locales', () => {
  for (const section of ['common', 'teacher', 'admin']) {
    assert.ok(english[section]);
    assert.ok(vietnamese[section]);
  }

  for (const key of ['retry', 'sessionExpired']) {
    assert.ok(english.common[key]);
    assert.ok(vietnamese.common[key]);
  }

  for (const key of ['classesLoadError', 'classesLoadEmptyError', 'classesForbidden']) {
    assert.ok(english.teacher[key]);
    assert.ok(vietnamese.teacher[key]);
  }

  for (const key of ['classLoadError', 'classLoadEmptyError', 'classForbidden', 'studentsLoadError', 'studentsLoadEmptyError', 'studentsForbidden']) {
    assert.ok(english.teacher.details[key]);
    assert.ok(vietnamese.teacher.details[key]);
  }

  for (const key of ['usersLoadError', 'usersLoadEmptyError', 'usersForbidden', 'usersEmpty', 'rolesLoadError', 'rolesLoadEmptyError', 'rolesForbidden', 'rolesEmpty', 'rolesLoading']) {
    assert.ok(english.admin[key]);
    assert.ok(vietnamese.admin[key]);
  }
});
