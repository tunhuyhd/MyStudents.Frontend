import { expect, type Page, type Route } from '@playwright/test';

export const longVietnameseName = 'Nguyễn Thị Minh Anh Trần Gia Bảo Phạm Hoàng Yến Đặng Quốc Khánh';
export const longEnglishName = 'Alexandria Elizabeth Montgomery-Smith McAllister';
export const longVietnameseClassName = 'Lớp luyện thi Toán nâng cao dành cho học sinh cuối cấp '.repeat(8).trim();
export const longEnglishClassName = 'Advanced mathematics preparation class for senior students '.repeat(8).trim();

const adminUser = {
  id: 'admin-fixture-1',
  username: 'test-admin',
  email: 'admin@example.test',
  fullName: 'Test Administrator',
  role: 'Admin',
  imageUrl: null,
};

export const adminUsers = [
  {
    id: 'user-long-vi',
    username: 'nguyen.minh.anh.' + 'student.'.repeat(8),
    email: 'minhanh.' + 'very-long-contact-address.'.repeat(7) + '@example.test',
    fullName: longVietnameseName,
    roleName: 'Teacher',
    roleId: 'role-teacher',
    status: 1,
  },
  {
    id: 'user-long-en',
    username: 'alexandria.' + 'montgomery.'.repeat(5),
    email: 'alexandria.' + 'long.email.address.'.repeat(7) + '@example.test',
    fullName: longEnglishName,
    roleName: 'Admin',
    roleId: 'role-admin',
    status: 2,
  },
  {
    id: 'user-short-teacher',
    username: 'teacher.one',
    email: 'teacher.one@example.test',
    fullName: 'Lê Thu Hà',
    roleName: 'Teacher',
    roleId: 'role-teacher',
    status: 1,
  },
  {
    id: 'user-short-student',
    username: 'student.one',
    email: 'student.one@example.test',
    fullName: 'Jordan Lee',
    roleName: 'Student',
    roleId: 'role-student',
    status: 2,
  },
];

export const adminRoles = [
  { id: 'role-admin', name: 'Admin' },
  { id: 'role-teacher', name: 'Teacher' },
  { id: 'role-student', name: 'Student' },
];

export const adminSubjects = [
  { id: 'subject-fixture-1', name: 'Mathematics', description: 'Algebra and geometry lessons for the dark-theme contrast fixture.' },
];

export async function installAdminFixtures(page: Page, language: 'vi' | 'en' = 'en') {
  await page.addInitScript((selectedLanguage) => {
    localStorage.setItem('accessToken', 'playwright-only-token');
    localStorage.setItem('refreshToken', 'playwright-only-refresh-token');
    localStorage.setItem('language', selectedLanguage);
  }, language);

  await page.route('**/api/v1/**', async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/\/api\/v1\/?/, '/');
    const method = request.method();

    if (path === '/auth/me' && method === 'GET') {
      await route.fulfill({ json: adminUser });
      return;
    }
    if (path === '/admin/users' && method === 'GET') {
      await route.fulfill({ json: adminUsers });
      return;
    }
    if (path === '/admin/roles' && method === 'GET') {
      await route.fulfill({ json: adminRoles });
      return;
    }
    if (path === '/subjects' && method === 'GET') {
      await route.fulfill({ json: adminSubjects });
      return;
    }
    if (/^\/admin\/users\/[^/]+\/status$/.test(path) && method === 'PATCH') {
      const errorCopy = language === 'vi' ? longVietnameseClassName : longEnglishClassName;
      await route.fulfill({
        status: 500,
        json: {
          errorCode: 'ERR_SCHEDULE_OVERLAP',
          parameters: { className: errorCopy, day: 'Monday', startTime: '09:00', endTime: '10:00' },
        },
      });
      return;
    }
    if (/^\/admin\/users\/[^/]+\/role$/.test(path) && method === 'PUT') {
      await route.fulfill({ status: 200, json: {} });
      return;
    }

    await route.fulfill({ status: 404, json: { message: `Unmocked test request: ${method} ${path}` } });
  });
}

export async function openAdminUsers(page: Page, language: 'vi' | 'en' = 'en') {
  await installAdminFixtures(page, language);
  await page.goto('/admin');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: adminUsers[0].username })).toHaveCount(1);
  await expect(page.getByText(longVietnameseName, { exact: true })).toBeAttached();
}
