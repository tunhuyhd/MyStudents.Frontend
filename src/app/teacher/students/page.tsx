'use client';

import Link from 'next/link';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, ChevronRight, ChevronLeft, Filter, UserPlus, Loader2, RefreshCw } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { UserRoles } from '@/constants/roles';

import { studentService, Student, CreateStudentData, PaginatedResponse } from '@/services/studentService';
import StudentModal from '@/components/teacher/StudentModal';
import ConfirmModal from '@/components/teacher/ConfirmModal';
import { apiErrorMessage } from '@/lib/apiError';

export default function StudentsPage() {
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInfo, setPageInfo] = useState<Pick<PaginatedResponse<Student>, 'totalPages' | 'totalCount' | 'pageSize' | 'hasNextPage' | 'hasPreviousPage'>>({ totalPages: 0, totalCount: 0, pageSize: 12, hasNextPage: false, hasPreviousPage: false });
  const [reloadKey, setReloadKey] = useState(0);
  const [listError, setListError] = useState('');
  const [actionError, setActionError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRoles.User)) {
      router.push('/auth/login');
      return;
    }
    if (!user) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setListError('');
      try {
        const res = await studentService.getAll({
          pageNumber,
          pageSize: 12,
          searchTerm: searchQuery.trim() || undefined,
          status: statusFilter ? Number(statusFilter) : undefined,
        }, controller.signal);
        if (controller.signal.aborted) return;
        setStudents(res.data.items);
        setPageInfo({
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount,
          pageSize: res.data.pageSize,
          hasNextPage: res.data.hasNextPage,
          hasPreviousPage: res.data.hasPreviousPage,
        });
        if (res.data.totalPages > 0 && pageNumber > res.data.totalPages) setPageNumber(res.data.totalPages);
      } catch (error: unknown) {
        if (!controller.signal.aborted) setListError(apiErrorMessage(error, t, 'teacher.students.loadError'));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, searchQuery.trim() ? 300 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [user, authLoading, router, pageNumber, searchQuery, statusFilter, reloadKey, t]);

  const handleSaveStudent = async (data: CreateStudentData) => {
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, { ...data, id: editingStudent.id });
      } else {
        await studentService.create(data);
      }
      setSearchQuery('');
      setStatusFilter('');
      setPageNumber(1);
      setReloadKey(key => key + 1);
    } catch (err) {
      console.error('Failed to save student', err);
      throw err;
    }
  };

  const handleEdit = (s: Student) => {
    setEditingStudent(s);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setActionError('');
    setDeletingStudentId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudentId) return;
    setIsDeleting(true);
    setActionError('');
    try {
      await studentService.delete(deletingStudentId);
      setDeletingStudentId(null);
      setIsDeleteModalOpen(false);
      setReloadKey(key => key + 1);
    } catch (error: unknown) {
      setActionError(apiErrorMessage(error, t, 'common.saveError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (studentId: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 2 : 1;
    setUpdatingStatusId(studentId);
    setActionError('');
    try {
      await studentService.updateStatus(studentId, newStatus);
      setReloadKey(key => key + 1);
    } catch (error: unknown) {
      setActionError(apiErrorMessage(error, t, 'common.saveError'));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter);

  return (
    <div className="club-page club-student-list campus-page space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-5 relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-3xl font-semibold text-surface-900 tracking-tight leading-none">
            {t('teacher.students.title') || 'Danh sách học sinh'}
          </h1>
          <p className="text-surface-500 font-medium text-sm max-w-md leading-relaxed">
            {t('teacher.students.subtitle') || 'Quản lý hồ sơ, thông tin liên lạc và theo dõi tiến độ học tập của học sinh.'}
          </p>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="campus-toolbar"
        >
          <div className="relative group flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-surface-500 group-focus-within:text-brand-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t('teacher.students.searchPlaceholder') || 'Tìm tên, email hoặc SĐT...'}
              value={searchQuery}
              aria-label={t('teacher.students.searchLabel')}
              maxLength={200}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNumber(1);
                setStudents([]);
                setPageInfo({ totalPages: 0, totalCount: 0, pageSize: 12, hasNextPage: false, hasPreviousPage: false });
                setLoading(true);
              }}
              className="h-11 pl-11 pr-8 bg-white border border-surface-100 rounded-xl text-sm font-medium text-surface-700 placeholder:text-surface-500 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all w-full md:w-60 outline-none"
            />
          </div>

          <Select label={t('teacher.students.statusFilter')} value={statusFilter}
            icon={<Filter />} className="club-status-filter"
            options={[{value:'',label:t('teacher.students.allStatuses')},{value:'1',label:t('teacher.status.active')},{value:'2',label:t('teacher.status.inactive')}]}
            onChange={value=>{
              setStatusFilter(value);setPageNumber(1);setStudents([]);
              setPageInfo({totalPages:0,totalCount:0,pageSize:12,hasNextPage:false,hasPreviousPage:false});setLoading(true);
            }} />

          <Button
            onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
            className="h-11 px-8 rounded-xl bg-brand-action hover:bg-brand-action-hover text-white font-semibold group w-full md:w-auto"
          >
            <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            {t('teacher.students.addBtn') || 'Thêm học sinh'}
          </Button>
        </motion.div>
      </div>

      {actionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{actionError}</p>}

      {/* Main Grid Section */}
      <div className="relative z-10">
        {listError ? (
          <div role="alert" className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-800">{listError}</p>
            <Button onClick={() => setReloadKey(key => key + 1)} className="rounded-xl bg-white px-5 py-3 text-red-700">
              <RefreshCw className="mr-2 h-4 w-4" />{t('teacher.students.retry')}
            </Button>
          </div>
        ) : loading && students.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-white animate-pulse rounded-xl border border-surface-50" />
            ))}
          </div>
        ) : students.length > 0 ? (
          <div aria-busy={loading} className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {students.map(student => (
              <article key={student.id} className="campus-record">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-surface-100 grid place-items-center shrink-0 text-sm font-semibold text-brand-text">{student.firstName.substring(0,1)}{student.lastName.substring(0,1)}</div>
                  <div className="min-w-0"><Link href={`/teacher/students/${student.id}`} className="font-semibold text-surface-900 hover:text-brand-text break-words">{student.lastName} {student.firstName}</Link><p className="text-xs text-surface-500 mt-1 break-words">{student.school || t('teacher.students.enrolledSince') + ': ' + new Date(student.createdOn).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</p></div>
                </div>
                <div className="space-y-1.5 min-w-0 text-sm text-surface-600">
                  {student.email && <p className="break-all">{student.email}</p>}
                  {student.phone && <p className="tabular-nums">{student.phone}</p>}
                  {!student.email && !student.phone && <span>—</span>}
                </div>
                <button type="button" onClick={() => handleUpdateStatus(student.id,student.status)} disabled={updatingStatusId === student.id} aria-busy={updatingStatusId === student.id} aria-label={t('teacher.students.changeStatus', { name: `${student.firstName} ${student.lastName}` })} className={`min-h-11 px-3 rounded-lg text-xs font-medium border disabled:opacity-50 ${student.status === 1 ? 'bg-surface-100 text-brand-text border-surface-200' : 'bg-white text-surface-500 border-surface-200'}`}>
                  {student.status === 1 ? t('teacher.status.active') : t('teacher.status.inactive')}{updatingStatusId === student.id && <Loader2 className="h-3 w-3 animate-spin inline ml-2" />}
                </button>
                <div className="campus-record-actions">
                  <Button variant="outline" onClick={() => router.push(`/teacher/students/${student.id}`)}>{t('common.details')}<ChevronRight className="h-4 w-4" /></Button>
                  <button type="button" onClick={() => handleEdit(student)} aria-label={t('teacher.students.editStudent', { name: `${student.firstName} ${student.lastName}` })} className="campus-icon-button"><Edit className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDeleteClick(student.id)} aria-label={t('teacher.students.deleteStudent', { name: `${student.firstName} ${student.lastName}` })} className="campus-icon-button hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-8 bg-white border-2 border-dashed border-surface-100 rounded-xl"
          >
            <div className="w-24 h-24 bg-surface-50 rounded-xl flex items-center justify-center">
              <Users className="w-10 h-10 text-surface-200" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-surface-900 tracking-tight">{hasActiveFilters ? t('teacher.students.noResultsTitle') : t('teacher.students.noStudentsTitle')}</h3>
              <p className="text-surface-400 font-medium">{hasActiveFilters ? t('teacher.students.noResultsDesc') : t('teacher.students.noStudentsDesc')}</p>
            </div>
            {hasActiveFilters ? (
              <Button onClick={() => { setSearchQuery(''); setStatusFilter(''); setPageNumber(1); }} className="h-12 px-10 rounded-lg bg-white border border-surface-200 text-surface-700 font-medium">
                {t('teacher.students.clearFilters')}
              </Button>
            ) : (
              <Button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="h-12 px-10 rounded-lg bg-brand-action text-white font-semibold">
                <Plus className="w-5 h-5 mr-3" />{t('teacher.students.addNowBtn')}
              </Button>
            )}
          </motion.div>
        )}
        {!listError && pageInfo.totalCount > 0 && (
          <div className="mt-8 flex flex-col gap-4 rounded-xl border border-surface-100 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-sm font-semibold text-surface-500">
              {t('teacher.students.resultsCount', { count: pageInfo.totalCount })}
              {loading && <span className="ml-2">· {t('common.loading')}</span>}
            </p>
            {pageInfo.totalPages > 1 && (
              <nav aria-label={t('teacher.students.pagination')} className="flex items-center justify-between gap-3 sm:justify-end">
                <Button type="button" onClick={() => setPageNumber(page => Math.max(1, page - 1))} disabled={!pageInfo.hasPreviousPage || loading} className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-700 disabled:opacity-50">
                  <ChevronLeft aria-hidden="true" className="mr-1 h-4 w-4" />{t('teacher.students.previousPage')}
                </Button>
                <span className="whitespace-nowrap text-sm font-medium text-surface-600">{t('teacher.students.pageOf', { page: pageNumber, total: pageInfo.totalPages })}</span>
                <Button type="button" onClick={() => setPageNumber(page => page + 1)} disabled={!pageInfo.hasNextPage || loading} className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-700 disabled:opacity-50">
                  {t('teacher.students.nextPage')}<ChevronRight aria-hidden="true" className="ml-1 h-4 w-4" />
                </Button>
              </nav>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={editingStudent}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('teacher.students.deleteTitle') || 'Xóa học sinh'}
        message={t('teacher.students.deleteMsg') || 'Bạn có chắc chắn muốn xóa học sinh này không? Hành động này không thể hoàn tác.'}
        confirmText={t('common.delete')}
        isLoading={isDeleting}
        error={actionError}
      />
    </div>
  );
}
