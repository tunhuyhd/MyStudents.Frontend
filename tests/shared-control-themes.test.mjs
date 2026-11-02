import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const button = read('../src/components/ui/Button.tsx');
const input = read('../src/components/ui/Input.tsx');
const globalStyles = read('../src/app/globals.css');
const adminPage = read('../src/app/admin/page.tsx');
const adminLogin = read('../src/app/admin/login/page.tsx');
const subjects = read('../src/components/admin/SubjectManagement.tsx');

test('shared Button adds a backward-compatible light default and explicit dark variant', () => {
  assert.match(button, /theme\?: 'light' \| 'dark'/);
  assert.match(button, /theme = 'light'/);
  assert.match(button, /data-theme=\{theme\}/);
  assert.match(button, /data-variant=\{variant\}/);
  assert.match(globalStyles, /\.ui-button\[data-theme="light"\]\[data-variant="primary"\]/);
  assert.match(globalStyles, /\.ui-button\[data-theme="dark"\]\[data-variant="primary"\]/);
  assert.match(globalStyles, /\.ui-button\[data-theme="dark"\]:focus-visible/);
});

test('shared Input centralizes dark labels, placeholder, focus, error and success states', () => {
  assert.match(input, /theme\?: 'light' \| 'dark'/);
  assert.match(input, /success\?: boolean/);
  assert.match(input, /const state = error \? 'error' : success \? 'success' : 'default'/);
  assert.match(input, /data-control-theme=\{theme\}/);
  assert.match(input, /data-state=\{state\}/);
  assert.match(globalStyles, /--control-dark-placeholder: #d8ebe2/);
  assert.match(globalStyles, /\.ui-input\[data-theme="dark"\]:focus-visible/);
  assert.match(globalStyles, /\.ui-input\[data-state="error"\]/);
  assert.match(globalStyles, /\.ui-input\[data-state="success"\]/);
  assert.match(globalStyles, /\.ui-input:disabled/);
});

test('Admin shared controls use the approved light theme without per-input color overrides', () => {
  assert.match(adminPage, /variant="outline"\s+theme="light"/);
  assert.match(adminLogin, /<Input\s+theme="light"/);
  assert.match(adminLogin, /<Button\s+[\s\S]*?theme="light"/);
  assert.equal((subjects.match(/<Input\s+theme="light"/g) ?? []).length, 2);
  assert.match(subjects, /<Button\s+theme="light"/);
  assert.doesNotMatch(subjects, /className="bg-white\/5 border-white\/10 text-white focus:bg-white\/10"/);
});
