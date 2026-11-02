'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { User, Mail, Phone, GraduationCap, MapPin, Calendar, ArrowLeft, Edit, Users, FileText, Clock, ShieldCheck, ChevronRight } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter, useParams } from 'next/navigation';
import { UserRoles } from '@/constants/roles';
import { studentService, Student, CreateStudentData } from '@/services/studentService';
import { apiErrorMessage } from '@/lib/apiError';
import StudentModal from '@/components/teacher/StudentModal';

export default function StudentDetailPage() {
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudent = useCallback(async () => {
    setLoading(true);setLoadError('');
    try {
      const res = await studentService.getById(studentId);
      setStudent(res.data);
    } catch (err) {
      console.error('Failed to fetch student details', err);
      setLoadError(apiErrorMessage(err, t, 'apiErrors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [studentId, t]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== UserRoles.User) {
      router.push('/auth/login');
      return;
    }
    if (studentId) {
      // Fetch server state after the route parameter becomes available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchStudent();
    }
  }, [user, authLoading, studentId, router, fetchStudent]);

  const handleSaveStudent = async (data: CreateStudentData) => {
    try {
      await studentService.update(studentId, { ...data, id: studentId });
      setLoading(true);
      await fetchStudent();
    } catch (err) {
      console.error('Failed to update student', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-40 bg-white rounded-xl border border-surface-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-xl border border-surface-50" />
          <div className="h-80 bg-white rounded-xl border border-surface-50" />
        </div>
      </div>
    );
  }

  if (loadError) return <div className="club-page space-y-4"><div role="alert" className="p-6 bg-red-50 text-red-800 rounded-xl">{loadError}</div><Button onClick={()=>void fetchStudent()}>{t('common.retry')}</Button><Button variant="outline" onClick={()=>router.push('/teacher/students')}>{t('common.back')}</Button></div>;
  if (!student) return null;

  return (
    <div className="club-page club-student-detail space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between relative z-10">
        <button
          onClick={() => router.push('/teacher/students')}
          className="flex items-center space-x-3 text-surface-400 hover:text-brand-text font-semibold transition-all group"
        >
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover: transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="tracking-normal text-xs">{t('common.back') || 'Quay lại'}</span>
        </button>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-8 rounded-lg bg-white border border-surface-100 text-surface-800 hover:bg-brand-action hover:text-white hover:border-brand-action hover: hover: transition-all duration-150 font-semibold group"
        >
          <Edit className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
          {t('common.edit') || 'Chỉnh sửa hồ sơ'}
        </Button>
      </div>

      {/* Hero Profile Section */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 md:p-8 border border-surface-50 relative overflow-hidden group"
      >

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary/5 rounded-xl flex items-center justify-center text-3xl md:text-3xl font-semibold text-brand-text">
            {student.firstName.substring(0, 1)}{student.lastName.substring(0, 1)}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-green-50 text-brand-text rounded-full text-xs font-semibold tracking-normal border border-green-100">
              <ShieldCheck className="w-3.5 h-3.5 mr-2" />
              {student.status === 1 ? t('teacher.status.active') : t('teacher.status.inactive')}
            </div>
            <h1 className="text-3xl md:text-3xl font-semibold text-surface-900 tracking-tight leading-none">
              {student.lastName} {student.firstName}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-surface-400 font-medium">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-brand-primary/40" />
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : '---'}
              </div>
              <div className="w-1.5 h-1.5 bg-surface-100 rounded-full" />
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-brand-primary/40" />
                {student.gender === 0 ? t('teacher.students.male') : student.gender === 1 ? t('teacher.students.female') : t('teacher.students.other')}
              </div>
              <div className="w-1.5 h-1.5 bg-surface-100 rounded-full" />
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-brand-primary/40" />
                {t('teacher.students.enrolledSince')}: {new Date(student.createdOn).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Info Card: School & Personal */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 border border-surface-50 space-y-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-surface-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-xl font-semibold text-surface-900 tracking-tight">{t('campus.studyContact')}</h3>
          </div>

          <div className="space-y-6">
            <DetailItem
              icon={<GraduationCap className="w-5 h-5" />}
              label={t('teacher.students.school') || 'Trường học'}
              value={student.school || '---'}
            />
            <DetailItem
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={student.email || '---'}
              isCopyable
            />
            <DetailItem
              icon={<Phone className="w-5 h-5" />}
              label={t('campus.studentPhone')}
              value={student.phone || '---'}
              isCopyable
            />
            <DetailItem
              icon={<MapPin className="w-5 h-5" />}
              label={t('teacher.students.address') || 'Địa chỉ'}
              value={student.address || '---'}
            />
          </div>
        </motion.div>

        {/* Info Card: Family & Guardian */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 border border-surface-50 space-y-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-surface-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-xl font-semibold text-surface-900 tracking-tight">{t('campus.parentContact')}</h3>
          </div>

          <div className="space-y-6">
            <DetailItem
              icon={<User className="w-5 h-5" />}
              label={t('teacher.students.parentName') || 'Họ tên phụ huynh'}
              value={student.parentName || '---'}
            />
            <DetailItem
              icon={<Phone className="w-5 h-5" />}
              label={t('teacher.students.parentPhone') || 'Số điện thoại phụ huynh'}
              value={student.parentPhone || '---'}
              isCopyable
            />
          </div>

          {student.parentPhone && <a href={`tel:${student.parentPhone.replace(/[^\d+]/g, '')}`} className="flex items-center justify-between gap-3 rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-brand-text"><span className="flex gap-3 items-center"><Phone className="h-4 w-4" />{t('campus.callParent')}</span><ChevronRight className="h-4 w-4" /></a>}
        </motion.div>
      </div>

      {/* Note Section */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 md:p-8 border border-surface-50 space-y-8"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-surface-50 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-brand-primary" />
          </div>
          <h3 className="text-xl font-semibold text-surface-900 tracking-tight">{t('teacher.students.note') || 'Ghi chú đặc biệt'}</h3>
        </div>

        <div className="p-6 bg-surface-50/50 rounded-xl border border-surface-100 min-h-[160px]">
          <p className="text-surface-600 font-medium leading-relaxed whitespace-pre-wrap">
            {student.note || t('campus.noNotes')}
          </p>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={student}
      />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  isCopyable = false
}: {
  icon: React.ReactNode,
  label: string,
  value: string,
  isCopyable?: boolean
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start space-x-5 group/item">
      <div className="mt-1 text-surface-400 group-hover/item:text-brand-primary transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-xs font-semibold text-brand-text tracking-normal">{label}</div>
        <div className="flex items-center justify-between">
          <div className="text-base font-medium text-surface-800 break-words">{value}</div>
          {isCopyable && value !== '---' && (
            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); } catch { setCopied(false); } }} className="min-h-11 px-2 text-xs font-semibold text-brand-text hover:underline">
              <span aria-live="polite">{copied ? t('campus.copied') : t('campus.copy')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
