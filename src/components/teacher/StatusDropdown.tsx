'use client';
import { useLanguage } from '@/context/LanguageContext';
import { Select } from '@/components/ui/Select';
interface StatusDropdownProps { value: number; onChange: (value: number) => void; disabled?: boolean }
export default function StatusDropdown({ value, onChange, disabled }: StatusDropdownProps) {
  const { t } = useLanguage();
  return <Select label={t('enrollmentStatus.label')} value={String(value)} onChange={next=>onChange(Number(next))}
    disabled={disabled} className="w-40" options={[
      {value:'1',label:t('enrollmentStatus.active')},
      {value:'2',label:t('enrollmentStatus.paused')},
      {value:'3',label:t('enrollmentStatus.completed')},
      {value:'4',label:t('enrollmentStatus.withdrawn')},
    ]} />;
}
