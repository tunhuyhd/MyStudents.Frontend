import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../src/components/admin/SubjectManagement.tsx', import.meta.url), 'utf8');
const vietnamese = JSON.parse(readFileSync(new URL('../src/locales/vi.json', import.meta.url), 'utf8'));
const english = JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url), 'utf8'));

test('subject actions remain visible without hover and have visible keyboard focus', () => {
  const actionContainer = source.match(/<div className="flex space-x-2">([\s\S]*?)<\/div>/)?.[1];

  assert.ok(actionContainer, 'subject action container should be present');
  assert.doesNotMatch(actionContainer, /opacity-0|group-hover:/);
  const actionButtons = actionContainer.match(/<button[\s\S]*?<\/button>/g) ?? [];
  assert.equal(actionButtons.length, 2);
  assert.ok(actionButtons.every(button => button.includes('focus-visible:outline')));
});

test('edit and delete actions have localized accessible names that include the subject name', () => {
  assert.match(source, /aria-label=\{t\('admin\.editSubject', \{ name: s\.name \}\)\}/);
  assert.match(source, /aria-label=\{t\('admin\.deleteSubject', \{ name: s\.name \}\)\}/);
  assert.equal(vietnamese.admin.editSubject, 'Chỉnh sửa môn học {name}');
  assert.equal(vietnamese.admin.deleteSubject, 'Xóa môn học {name}');
  assert.equal(english.admin.editSubject, 'Edit subject {name}');
  assert.equal(english.admin.deleteSubject, 'Delete subject {name}');
});

test('action handlers and native delete confirmation remain unchanged', () => {
  assert.match(source, /onClick=\{\(\) => handleEdit\(s\)\}/);
  assert.match(source, /onClick=\{\(\) => handleDelete\(s\.id\)\}/);
  assert.match(source, /if \(!confirm\('Are you sure you want to delete this subject\?'\)\) return;/);
});
