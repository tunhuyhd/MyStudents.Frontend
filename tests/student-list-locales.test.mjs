import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const vietnamese = JSON.parse(readFileSync(new URL('../src/locales/vi.json', import.meta.url), 'utf8'));
const english = JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url), 'utf8'));

const expectedTranslations = {
  searchLabel: {
    vi: 'Tìm kiếm học sinh',
    en: 'Search students',
  },
  statusFilter: {
    vi: 'Lọc theo trạng thái',
    en: 'Filter by status',
  },
  allStatuses: {
    vi: 'Tất cả trạng thái',
    en: 'All statuses',
  },
  retry: {
    vi: 'Thử lại',
    en: 'Try again',
  },
  loadError: {
    vi: 'Không thể tải danh sách học sinh. Vui lòng thử lại.',
    en: 'Unable to load students. Please try again.',
  },
  noResultsTitle: {
    vi: 'Không tìm thấy học sinh',
    en: 'No students found',
  },
  noResultsDesc: {
    vi: 'Thử thay đổi từ khóa hoặc bộ lọc trạng thái.',
    en: 'Try changing your search or status filter.',
  },
  clearFilters: {
    vi: 'Xóa bộ lọc',
    en: 'Clear filters',
  },
  resultsCount: {
    vi: '{count} học sinh',
    en: '{count} students',
  },
  pagination: {
    vi: 'Phân trang danh sách học sinh',
    en: 'Student list pagination',
  },
  previousPage: {
    vi: 'Trang trước',
    en: 'Previous',
  },
  nextPage: {
    vi: 'Trang sau',
    en: 'Next',
  },
  pageOf: {
    vi: 'Trang {page} / {total}',
    en: 'Page {page} of {total}',
  },
  editStudent: {
    vi: 'Chỉnh sửa học sinh {name}',
    en: 'Edit student {name}',
  },
  deleteStudent: {
    vi: 'Xóa học sinh {name}',
    en: 'Delete student {name}',
  },
  changeStatus: {
    vi: 'Thay đổi trạng thái của học sinh {name}',
    en: 'Change status for {name}',
  },
};

test('student list translations are readable and keep both locales aligned', () => {
  const viStudents = vietnamese.teacher.students;
  const enStudents = english.teacher.students;

  for (const [key, expected] of Object.entries(expectedTranslations)) {
    assert.equal(viStudents[key], expected.vi, `unexpected Vietnamese copy for ${key}`);
    assert.equal(enStudents[key], expected.en, `unexpected English copy for ${key}`);

    const viPlaceholders = viStudents[key].match(/\{[^}]+\}/g) ?? [];
    const enPlaceholders = enStudents[key].match(/\{[^}]+\}/g) ?? [];
    assert.deepEqual(viPlaceholders, enPlaceholders, `placeholder mismatch for ${key}`);
  }
});

test('V5 Teacher dashboard and Admin management copy is translated in both locales', () => {
  const sharedKeys = {
    admin: ['usersTab', 'subjectsTab', 'selectRole', 'subjectsTitle', 'cancel', 'addSubject', 'subjectName', 'subjectDescription', 'subjectNamePlaceholder', 'subjectDescriptionPlaceholder', 'createSubject', 'updateSubject', 'noDescription', 'deleteSubjectConfirm', 'loginTitle', 'loginSubtitle', 'loginIdentifier', 'securityKey', 'authorize', 'restrictedArea', 'loginFailed'],
    teacher: ['searchClasses', 'allYears', 'yearLabel', 'sortNewest', 'sortOldest', 'sortNameAscending', 'sortNameDescending', 'sortMostStudents', 'sortFewestStudents', 'classCreated', 'classUpdated', 'classesShowing', 'previousPage', 'nextPage', 'toBeAnnounced'],
  };

  for (const [section, keys] of Object.entries(sharedKeys)) {
    for (const key of keys) {
      const viValue = vietnamese[section][key];
      const enValue = english[section][key];
      assert.equal(typeof viValue, 'string', `missing Vietnamese ${section}.${key}`);
      assert.equal(typeof enValue, 'string', `missing English ${section}.${key}`);
      assert.notEqual(viValue, enValue, `${section}.${key} should be localized`);
      assert.deepEqual(viValue.match(/\{[^}]+\}/g) ?? [], enValue.match(/\{[^}]+\}/g) ?? [], `placeholder mismatch for ${section}.${key}`);
    }
  }
});
