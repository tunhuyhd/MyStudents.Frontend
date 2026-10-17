import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { getWrappedFocusIndex } = require('../.test-output/hooks/useAccessibleDialog.js');
const { canCloseDialog } = require('../.test-output/lib/dialog.js');
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const hook = read('../src/hooks/useAccessibleDialog.ts');
const classModal = read('../src/components/teacher/ClassModal.tsx');
const studentModal = read('../src/components/teacher/StudentModal.tsx');
const addStudentModal = read('../src/components/teacher/AddStudentToClassModal.tsx');
const sessionModal = read('../src/components/teacher/RecordSessionModal.tsx');
const confirmModal = read('../src/components/teacher/ConfirmModal.tsx');

test('dialog focus cycling wraps forward and backward, including no-focusable fallback', () => {
  assert.equal(getWrappedFocusIndex(2, 3, false), 0);
  assert.equal(getWrappedFocusIndex(0, 3, true), 2);
  assert.equal(getWrappedFocusIndex(-1, 3, false), 0);
  assert.equal(getWrappedFocusIndex(-1, 3, true), 2);
  assert.equal(getWrappedFocusIndex(0, 0, false), -1);
});

test('shared focus manager moves focus in, traps Tab and Shift+Tab, handles Escape and restores focus safely', () => {
  assert.match(hook, /data-dialog-initial-focus/);
  assert.match(hook, /initialFocus \|\| dialog\)\.focus\(\)/);
  assert.match(hook, /event\.key === 'Escape'[\s\S]*onEscapeRef\.current\(\)/);
  assert.match(hook, /event\.key !== 'Tab'/);
  assert.match(hook, /event\.shiftKey/);
  assert.match(hook, /tabbable\[nextIndex\]\.focus\(\)/);
  assert.match(hook, /previousFocus\.focus\(\)/);
  assert.match(hook, /querySelector<HTMLElement>\('main'\)/);
  assert.match(hook, /isTopDialog/);
});

test('each modal exposes modal semantics and a programmatic accessible name', () => {
  for (const source of [classModal, studentModal, addStudentModal, sessionModal, confirmModal]) {
    assert.match(source, /role="(?:dialog|alertdialog)"/);
    assert.match(source, /aria-modal="true"/);
    assert.match(source, /aria-(?:label|labelledby)=/);
    assert.match(source, /data-dialog-focus-scope="true"/);
    assert.match(source, /useAccessibleDialog/);
  }
  for (const source of [studentModal, addStudentModal, sessionModal, confirmModal]) {
    assert.match(source, /aria-describedby=/);
  }
  assert.match(confirmModal, /role="alertdialog"/);
  assert.match(confirmModal, /data-dialog-initial-focus="true"/);
});

test('dirty forms require explicit discard confirmation and keep current values when canceled', () => {
  assert.equal(canCloseDialog(false, () => { throw new Error('clean dialog should not prompt'); }), true);
  assert.equal(canCloseDialog(true, () => false), false);
  assert.equal(canCloseDialog(true, () => true), true);
  for (const source of [classModal, studentModal]) {
    assert.match(source, /initialFormSnapshot\.current !== JSON\.stringify\(formData\)/);
    assert.match(source, /window\.confirm\(t\('common\.discardChanges'\)\)/);
    assert.match(source, /onClick=\{requestClose\}/);
  }
  assert.match(sessionModal, /hasUnsavedChanges/);
  assert.match(sessionModal, /window\.confirm\(t\('common\.discardChanges'\)\)/);
  assert.match(sessionModal, /setHasUnsavedChanges\(true\)/);
  assert.match(sessionModal, /setHasUnsavedChanges\(false\)/);
});

test('unsaved-change prompt is localized in Vietnamese and English', () => {
  const en = JSON.parse(read('../src/locales/en.json'));
  const vi = JSON.parse(read('../src/locales/vi.json'));
  assert.ok(en.common.discardChanges);
  assert.ok(vi.common.discardChanges);
});
