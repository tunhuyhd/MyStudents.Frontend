import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { getToastDismissalDelay } = require('../.test-output/toast.js');
const source = readFileSync(new URL('../src/components/ui/Toast.tsx', import.meta.url), 'utf8');
const vietnamese = JSON.parse(readFileSync(new URL('../src/locales/vi.json', import.meta.url), 'utf8'));
const english = JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url), 'utf8'));

test('success feedback uses a polite status and errors use an urgent alert', () => {
  assert.match(source, /role=\{type === 'error' \? 'alert' : 'status'\}/);
  assert.match(source, /aria-live=\{type === 'error' \? 'assertive' : 'polite'\}/);
  assert.match(source, /aria-atomic="true"/);
});

test('dismiss button has a localized accessible name and invokes the existing close callback', () => {
  assert.match(source, /aria-label=\{t\('common\.close'\)\}/);
  assert.match(source, /onClick=\{onClose\}/);
  assert.equal(vietnamese.common.close, 'Đóng');
  assert.equal(english.common.close, 'Close');
});

test('important errors persist for manual dismissal while success and explicit durations retain timing', () => {
  assert.equal(getToastDismissalDelay('error'), null);
  assert.equal(getToastDismissalDelay('success'), 3000);
  assert.equal(getToastDismissalDelay('error', 5000), 5000);
  assert.equal(getToastDismissalDelay('success', 1200), 1200);
});

test('toast layout can shrink at 320px and wraps long messages', () => {
  assert.match(source, /w-\[calc\(100vw-2rem\)\]/);
  assert.match(source, /break-words text-sm/);
});
