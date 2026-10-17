import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { getPageEnrollmentCount } = require('../.test-output/dashboardMetrics.js');
const dashboard = readFileSync(new URL('../src/app/teacher/page.tsx', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/services/classService.ts', import.meta.url), 'utf8');
const en = JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url), 'utf8'));
const vi = JSON.parse(readFileSync(new URL('../src/locales/vi.json', import.meta.url), 'utf8'));

test('current-page enrollment metric handles empty data and sums only the provided page', () => {
  assert.equal(getPageEnrollmentCount([]), 0);

  const classes = Array.from({ length: 10 }, (_, index) => ({ studentCount: index + 1 }));
  const firstPage = classes.slice(0, 9);
  const secondPage = classes.slice(9, 18);

  assert.equal(getPageEnrollmentCount(firstPage), 45);
  assert.equal(getPageEnrollmentCount(secondPage), 10);
  assert.equal(getPageEnrollmentCount(classes), 55);
  assert.notEqual(getPageEnrollmentCount(firstPage), getPageEnrollmentCount(classes));
});

test('dashboard labels the page subtotal as enrollments and leaves pagination/filter requests intact', () => {
  assert.match(dashboard, /pageSize = 9/);
  assert.match(dashboard, /classService\.getAll\(\{[\s\S]*pageNumber,[\s\S]*pageSize/);
  assert.match(dashboard, /getPageEnrollmentCount\(classes\)/);
  assert.match(dashboard, /t\('teacher\.pageEnrollmentCount'\)/);
  assert.match(dashboard, /t\('teacher\.enrollments'\)/);
  assert.doesNotMatch(dashboard, /classes\.reduce\(\(acc, curr\) => acc \+ curr\.studentCount/);
  assert.match(service, /items: T\[\];[\s\S]*totalCount: number/);
  assert.match(service, /getAll: \(params\?.*pageNumber\?: number; pageSize\?: number/);
});

test('metric labels identify enrollments in the loaded page in both supported locales', () => {
  assert.equal(en.teacher.pageEnrollmentCount, 'Enrollments on this page');
  assert.equal(en.teacher.enrollments, 'enrollments');
  assert.equal(vi.teacher.pageEnrollmentCount, 'Lượt ghi danh trên trang này');
  assert.equal(vi.teacher.enrollments, 'lượt ghi danh');
});
