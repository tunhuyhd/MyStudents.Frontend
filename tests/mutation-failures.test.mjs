import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { mutationErrorMessage } = require('../.test-output/mutationError.js');
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const teacher = read('../src/app/teacher/page.tsx');
const classDetail = read('../src/app/teacher/class/[id]/page.tsx');
const addStudent = read('../src/components/teacher/AddStudentToClassModal.tsx');
const attendance = read('../src/components/teacher/RecordSessionModal.tsx');
const admin = read('../src/app/admin/page.tsx');
const subjects = read('../src/components/admin/SubjectManagement.tsx');
const classModal = read('../src/components/teacher/ClassModal.tsx');
const en = JSON.parse(read('../src/locales/en.json'));
const vi = JSON.parse(read('../src/locales/vi.json'));

test('mutation failures distinguish unauthorized, forbidden and retryable server/network errors', () => {
  const t = (key) => ({ 'common.sessionExpired': 'expired', 'common.permissionDenied': 'denied' })[key] ?? key;
  assert.equal(mutationErrorMessage({ response: { status: 401 } }, t), 'expired');
  assert.equal(mutationErrorMessage({ response: { status: 403 } }, t), 'denied');
  assert.equal(mutationErrorMessage({ response: { status: 503 } }, t), 'common.mutationFailed');
  assert.equal(mutationErrorMessage({ code: 'ECONNABORTED' }, t), 'common.mutationFailed');
});

test('teacher class delete retains confirmation intent after rejection and confirms success only after API success', () => {
  assert.match(teacher, /await classService\.delete\(deletingClassId\)/);
  assert.match(teacher, /setToast\(\{ isOpen: true, message: mutationErrorMessage\(err, t/);
  assert.match(teacher, /setIsDeleteModalOpen\(false\);\s*setDeletingClassId\(null\);\s*setToast\(\{ isOpen: true, message: t\('teacher\.classDeleted'\)/);
  assert.match(teacher, /finally \{\s*setIsDeleting\(false\);/);
  assert.doesNotMatch(teacher, /finally \{\s*setIsDeleting\(false\);\s*setDeletingClassId\(null\)/);
});

test('add-student and attendance failures remain recoverable and prevent concurrent duplicate requests', () => {
  assert.match(addStudent, /if \(addingId\) return/);
  assert.match(addStudent, /setAddError\(mutationErrorMessage\(err, t/);
  assert.match(addStudent, /setStudents\(prev => prev\.filter\(s => s\.id !== id\)\)/);
  assert.match(addStudent, /disabled=\{addingId !== null\}/);
  assert.match(classDetail, /await classService\.addStudent\(id as string, studentId\)/);
  assert.match(attendance, /if \(updatingAttendanceId\) return/);
  assert.match(attendance, /await classService\.updateAttendance\(\{ attendanceId, status \}\)/);
  assert.match(attendance, /setAttendances\(oldAttendances\);\s*setError\(mutationErrorMessage\(err, t/);
  assert.match(attendance, /disabled=\{updatingAttendanceId !== null\}/);
});

test('admin role/status mutations report failures and leave server-derived values untouched until refetch', () => {
  assert.match(admin, /await api\.put\(`\/admin\/users\/\$\{userId\}\/role`/);
  assert.match(admin, /await api\.patch\(`\/admin\/users\/\$\{userId\}\/status`/);
  assert.equal((admin.match(/message: mutationErrorMessage\(err, t/g) ?? []).length, 2);
  assert.match(admin, /if \(updatingId\) return/);
  assert.ok(admin.includes("t('admin.roleUpdated')"));
  assert.ok(admin.includes("t('admin.statusUpdated')"));
});

test('subject mutations keep failed form values, preserve confirmation flow and prevent duplicate submits', () => {
  assert.match(subjects, /if \(saving\) return/);
  assert.match(subjects, /setToast\(\{ isOpen: true, message: mutationErrorMessage\(err, t/);
  assert.match(subjects, /catch \(err\) \{\s*console\.error\('Failed to save subject', err\);\s*setToast/);
  assert.match(subjects, /if \(deletingId\) return/);
  assert.match(subjects, /if \(!confirm\(t\('admin\.deleteSubjectConfirm'\)\)\) return/);
  assert.match(subjects, /await subjectService\.delete\(id\)/);
  assert.match(classModal, /if \(loading\) return/);
  assert.match(classModal, /mutationErrorMessage\(error, t\)/);
});

test('mutation feedback and authorization messages exist in both locales', () => {
  for (const key of ['permissionDenied', 'mutationFailed']) {
    assert.ok(en.common[key]);
    assert.ok(vi.common[key]);
  }
  for (const key of ['roleUpdated', 'statusUpdated', 'subjectSaved', 'subjectDeleted']) {
    assert.ok(en.admin[key]);
    assert.ok(vi.admin[key]);
  }
  assert.ok(en.teacher.classDeleted);
  assert.ok(vi.teacher.classDeleted);
});
