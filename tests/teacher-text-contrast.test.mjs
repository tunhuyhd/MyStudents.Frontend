import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const css = read('../src/app/globals.css');
const teacherFiles = [
  '../src/app/teacher/page.tsx',
  '../src/app/teacher/students/page.tsx',
  '../src/app/teacher/students/[id]/page.tsx',
  '../src/app/teacher/class/[id]/page.tsx',
  '../src/components/teacher/ClassModal.tsx',
  '../src/components/teacher/StudentModal.tsx',
  '../src/components/teacher/AddStudentToClassModal.tsx',
  '../src/components/teacher/RecordSessionModal.tsx',
  '../src/components/teacher/StatusDropdown.tsx',
  '../src/components/LanguageSwitcher.tsx',
  '../src/components/ui/CustomDatePicker.tsx',
  '../src/app/me/page.tsx',
];

function getToken(name) {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `Expected the ${name} design token to be a six-digit hex color`);
  return match[1];
}

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255);
  const [red, green, blue] = channels.map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

test('semantic teacher emerald text meets AA normal-text contrast on declared light surfaces', () => {
  const foreground = getToken('brand-text');
  const backgrounds = [
    '#ffffff',
    getToken('surface-50'),
    getToken('surface-100'),
    getToken('surface-200'),
    getToken('surface-300'),
  ];

  for (const background of backgrounds) {
    assert.ok(
      contrastRatio(foreground, background) >= 4.5,
      `${foreground} on ${background} must be at least 4.5:1`,
    );
  }

  assert.ok(contrastRatio('#ffffff', getToken('brand-action')) >= 4.5);
});

test('teacher status text no longer uses the low-contrast green-600 foreground', () => {
  for (const path of teacherFiles) {
    assert.doesNotMatch(read(path), /text-green-600/);
  }
  assert.match(read('../src/app/teacher/page.tsx'), /bg-green-50 text-brand-text/);
  assert.match(read('../src/app/teacher/class/[id]/page.tsx'), /bg-green-100 text-brand-text/);
  assert.match(read('../src/components/teacher/RecordSessionModal.tsx'), /color: 'text-brand-text'/);
  assert.match(read('../src/components/LanguageSwitcher.tsx'), /bg-white text-brand-text/);
  assert.match(read('../src/components/ui/CustomDatePicker.tsx'), /bg-brand-action text-white/);
  assert.match(read('../src/app/me/page.tsx'), /bg-green-100 text-brand-text/);
});

test('small white text uses the deep emerald action fill instead of bright decorative emerald', () => {
  for (const path of teacherFiles) {
    const source = read(path);
    assert.doesNotMatch(source, /bg-brand-primary[^'"`]*text-white/);
    assert.doesNotMatch(source, /bg-green-500[^'"`]*text-white/);
  }
});
