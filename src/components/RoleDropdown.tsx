'use client';
import { useLanguage } from '@/context/LanguageContext';
import { Select } from './ui/Select';
interface Role { id: string; name: string }
interface RoleDropdownProps { roles: Role[]; currentRoleId: string; onUpdate: (roleId: string) => void; disabled?: boolean }
export default function RoleDropdown({ roles, currentRoleId, onUpdate, disabled }: RoleDropdownProps) {
  const { t } = useLanguage();
  return <Select label={t('admin.selectRole')} value={currentRoleId} disabled={disabled}
    onChange={onUpdate} options={roles.map(role=>({value:role.id,label:role.name}))} className="club-role-select" />;
}
