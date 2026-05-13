export const UserRoles = {
  Admin: 'Admin',
  User: 'User',
  Teacher: 'Teacher',
  Student: 'Student',
} as const;

export type UserRole = keyof typeof UserRoles;
