'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search,
  Edit, 
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Filter,
  UserPlus,
  Loader2,
  RefreshCw
} from 'lucide-react';
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
    setDeletingStudentId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudentId) return;
    setIsDeleting(true);
    setActionError('');
    try {
      await studentService.delete(deletingStudentId);
      setIsDeleteModalOpen(false);
      setReloadKey(key => key + 1);
    } catch (error: unknown) {
      setActionError(apiErrorMessage(error, t, 'common.saveError'));
    } finally {
      setIsDeleting(false);
      setDeletingStudentId(null);
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
    <div className="max-w-7xl mx-auto px-6 pt-0 lg:pt-4 space-y-12 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center px-4 py-1.5 bg-brand-primary/10 rounded-full text-brand-text text-[10px] font-black uppercase tracking-[0.2em] border border-brand-primary/10">
            <Users className="w-4 h-4 mr-2" />
            {t('teacher.students.management') || 'Quản lý học sinh'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-surface-900 tracking-tighter leading-none">
            {t('teacher.students.title') || 'Danh sách học sinh'}
          </h1>
          <p className="text-surface-500 font-medium text-lg max-w-md leading-relaxed">
            {t('teacher.students.subtitle') || 'Quản lý hồ sơ, thông tin liên lạc và theo dõi tiến độ học tập của học sinh.'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 w-full md:w-auto"
        >
          <div className="relative group flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-surface-300 group-focus-within:text-brand-primary transition-colors" />
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
              className="h-16 pl-16 pr-8 bg-white border border-surface-100 rounded-[2rem] text-sm font-bold text-surface-700 placeholder:text-surface-300 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all w-full md:w-80 shadow-sm outline-none"
            />
          </div>

          <label className="relative flex-1 md:flex-none">
            <span className="sr-only">{t('teacher.students.statusFilter')}</span>
            <Filter aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={event => {
                setStatusFilter(event.target.value);
                setPageNumber(1);
                setStudents([]);
                setPageInfo({ totalPages: 0, totalCount: 0, pageSize: 12, hasNextPage: false, hasPreviousPage: false });
                setLoading(true);
              }}
              className="h-16 w-full md:w-52 pl-11 pr-5 rounded-[2rem] border border-surface-100 bg-white text-sm font-bold text-surface-700 shadow-sm outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10"
            >
              <option value="">{t('teacher.students.allStatuses')}</option>
              <option value="1">{t('teacher.status.active')}</option>
              <option value="2">{t('teacher.status.inactive')}</option>
            </select>
          </label>

          <Button 
            onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
            className="h-16 px-8 rounded-[2rem] bg-brand-action hover:bg-brand-action-hover shadow-2xl shadow-brand-primary/20 text-white font-black group w-full md:w-auto"
          >
            <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            {t('teacher.students.addBtn') || 'Thêm học sinh'}
          </Button>
        </motion.div>
      </div>

      {actionError && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{actionError}</p>}

      {/* Main Grid Section */}
      <div className="relative z-10">
        {listError ? (
          <div role="alert" className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center">
            <p className="font-semibold text-red-800">{listError}</p>
            <Button onClick={() => setReloadKey(key => key + 1)} className="rounded-xl bg-white px-5 py-3 text-red-700 shadow-sm">
              <RefreshCw className="mr-2 h-4 w-4" />{t('teacher.students.retry')}
            </Button>
          </div>
        ) : loading && students.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white/50 animate-pulse rounded-[3rem] border border-surface-50" />
            ))}
          </div>
        ) : students.length > 0 ? (
          <div aria-busy={loading} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {students.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white hover:bg-brand-primary/5 border border-surface-50 hover:border-brand-primary/20 rounded-[3rem] p-8 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/5 flex flex-col"
              >
                {/* Actions Dropdown Overay (Simplified for direct access) */}
                <div className="absolute top-6 right-6 flex space-x-2 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <button 
                    onClick={() => handleEdit(student)}
                    aria-label={t('teacher.students.editStudent', { name: `${student.firstName} ${student.lastName}` })}
                    className="p-3 bg-white shadow-xl rounded-2xl text-surface-500 hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(student.id)}
                    aria-label={t('teacher.students.deleteStudent', { name: `${student.firstName} ${student.lastName}` })}
                    className="p-3 bg-white shadow-xl rounded-2xl text-surface-500 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Header */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 bg-surface-50 rounded-[2rem] flex items-center justify-center text-2xl font-black text-brand-text group-hover:bg-white transition-colors">
                    {student.firstName.substring(0, 1)}{student.lastName.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-surface-900 tracking-tight group-hover:text-brand-text transition-colors">
                      {student.lastName} {student.firstName}
                    </h3>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className="text-xs font-black text-brand-text uppercase tracking-widest">
                        {student.gender === 0 ? t('teacher.students.male') : student.gender === 1 ? t('teacher.students.female') : t('teacher.students.other')}
                      </span>
                      <button
                        onClick={() => handleUpdateStatus(student.id, student.status)}
                        aria-label={t('teacher.students.changeStatus', { name: `${student.firstName} ${student.lastName}` })}
                        aria-busy={updatingStatusId === student.id}
                        disabled={updatingStatusId === student.id}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                          student.status === 1 
                          ? 'bg-green-50 text-brand-text border border-green-100'
                          : 'bg-surface-100 text-surface-400 border border-surface-200'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${student.status === 1 ? 'bg-green-500 animate-pulse' : 'bg-surface-300'}`} />
                        {student.status === 1 ? t('teacher.status.active') : t('teacher.status.inactive')}
                        {updatingStatusId === student.id && <Loader2 className="w-2.5 h-2.5 animate-spin ml-1" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student Details */}
                <div className="space-y-4 flex-1">
                  {student.email && (
                    <div className="flex items-center text-surface-400 text-sm font-medium">
                      <Mail className="w-4 h-4 mr-3 text-surface-200" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center text-surface-400 text-sm font-medium">
                      <Phone className="w-4 h-4 mr-3 text-surface-200" />
                      {student.phone}
                    </div>
                  )}
                  {student.school && (
                    <div className="flex items-center text-surface-400 text-sm font-medium">
                      <GraduationCap className="w-4 h-4 mr-3 text-surface-200" />
                      <span className="truncate">{student.school}</span>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start text-surface-400 text-sm font-medium">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 text-surface-200" />
                      <span className="line-clamp-1">{student.address}</span>
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="mt-8 pt-8 border-t border-surface-50/50 flex items-center justify-between">
                  <div className="text-[10px] font-black text-surface-300 uppercase tracking-widest">
                    {t('teacher.students.enrolledSince') || 'Học sinh từ'}: {new Date(student.createdOn).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                  </div>
                  <button 
                    onClick={() => router.push(`/teacher/students/${student.id}`)}
                    className="flex items-center space-x-2 text-brand-text font-black text-xs hover:opacity-70 transition-opacity"
                  >
                    <span>{t('common.details') || 'Chi tiết'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 space-y-8 bg-white/40 border-2 border-dashed border-surface-100 rounded-[4rem]"
          >
            <div className="w-24 h-24 bg-surface-50 rounded-[2.5rem] flex items-center justify-center">
              <Users className="w-10 h-10 text-surface-200" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-surface-900 tracking-tight">{hasActiveFilters ? t('teacher.students.noResultsTitle') : t('teacher.students.noStudentsTitle')}</h3>
              <p className="text-surface-400 font-medium">{hasActiveFilters ? t('teacher.students.noResultsDesc') : t('teacher.students.noStudentsDesc')}</p>
            </div>
            {hasActiveFilters ? (
              <Button onClick={() => { setSearchQuery(''); setStatusFilter(''); setPageNumber(1); }} className="h-14 px-10 rounded-2xl bg-white border border-surface-200 text-surface-700 font-bold">
                {t('teacher.students.clearFilters')}
              </Button>
            ) : (
              <Button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="h-14 px-10 rounded-2xl bg-brand-action shadow-xl shadow-brand-primary/10 text-white font-black">
                <Plus className="w-5 h-5 mr-3" />{t('teacher.students.addNowBtn')}
              </Button>
            )}
          </motion.div>
        )}
        {!listError && pageInfo.totalCount > 0 && (
          <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-surface-100 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-sm font-semibold text-surface-500">
              {t('teacher.students.resultsCount', { count: pageInfo.totalCount })}
              {loading && <span className="ml-2">· {t('common.loading')}</span>}
            </p>
            {pageInfo.totalPages > 1 && (
              <nav aria-label={t('teacher.students.pagination')} className="flex items-center justify-between gap-3 sm:justify-end">
                <Button type="button" onClick={() => setPageNumber(page => Math.max(1, page - 1))} disabled={!pageInfo.hasPreviousPage || loading} className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-bold text-surface-700 disabled:opacity-50">
                  <ChevronLeft aria-hidden="true" className="mr-1 h-4 w-4" />{t('teacher.students.previousPage')}
                </Button>
                <span className="whitespace-nowrap text-sm font-bold text-surface-600">{t('teacher.students.pageOf', { page: pageNumber, total: pageInfo.totalPages })}</span>
                <Button type="button" onClick={() => setPageNumber(page => page + 1)} disabled={!pageInfo.hasNextPage || loading} className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-bold text-surface-700 disabled:opacity-50">
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
        confirmText={t('teacher.modal.delete') || 'Xóa hồ sơ'}
        isLoading={isDeleting}
      />
    </div>
  );
}
