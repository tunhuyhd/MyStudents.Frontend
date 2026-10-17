import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { DEFAULT_LANGUAGE, getStoredLanguage, LANGUAGE_STORAGE_KEY, persistLanguage } = require('../.test-output/language.js');

function storageWith(value = null) {
  const values = new Map(value === null ? [] : [[LANGUAGE_STORAGE_KEY, value]]);
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, nextValue) => values.set(key, nextValue),
    values,
  };
}

test('document language defaults to Vietnamese when no preference is stored', () => {
  assert.equal(DEFAULT_LANGUAGE, 'vi');
  assert.equal(getStoredLanguage(storageWith()), 'vi');
});

test('persisted Vietnamese and English preferences are restored', () => {
  assert.equal(getStoredLanguage(storageWith('vi')), 'vi');
  assert.equal(getStoredLanguage(storageWith('en')), 'en');
  assert.equal(getStoredLanguage(storageWith('fr')), 'vi');
});

test('runtime language changes persist the locale and synchronize the document root', () => {
  const storage = storageWith('vi');
  const documentRoot = { lang: 'vi' };

  persistLanguage('en', storage, documentRoot);
  assert.equal(storage.values.get(LANGUAGE_STORAGE_KEY), 'en');
  assert.equal(documentRoot.lang, 'en');

  persistLanguage('vi', storage, documentRoot);
  assert.equal(storage.values.get(LANGUAGE_STORAGE_KEY), 'vi');
  assert.equal(documentRoot.lang, 'vi');
});

test('root layout bootstraps stored document language before hydration', () => {
  const layout = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  const context = readFileSync(new URL('../src/context/LanguageContext.tsx', import.meta.url), 'utf8');

  assert.match(layout, /lang=\{DEFAULT_LANGUAGE\}/);
  assert.match(layout, /strategy="beforeInteractive"/);
  assert.match(layout, /localStorage\.getItem\("\$\{LANGUAGE_STORAGE_KEY\}"\)/);
  assert.match(context, /getStoredLanguage\(localStorage\)/);
  assert.match(context, /persistLanguage\(lang, localStorage, document\.documentElement\)/);
});
