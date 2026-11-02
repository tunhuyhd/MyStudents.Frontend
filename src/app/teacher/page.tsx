'use client';

import { ClubClassCard } from '@/components/teacher/ClubClassCard';

import Link from 'next/link';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, RefreshCw, ChevronRight, Search, Filter, ArrowUpDown, ChevronDown, Check } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { UserRoles } from '@/constants/roles';

import { classService, Class, CreateClassData } from '@/services/classService';
import ClassModal from '@/components/teacher/ClassModal';
import ConfirmModal from '@/components/teacher/ConfirmModal';
import { Toast } from '@/components/ui/Toast';
import { classifyLoadFailure, getListLoadState, isRetryableLoadFailure, type LoadFailure } from '@/lib/loadFailure';
import { mutationErrorMessage } from '@/lib/mutationError';
import { getPageEnrollmentCount } from '@/lib/dashboardMetrics';

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesLoadFailure, setClassesLoadFailure] = useState<LoadFailure | null>(null);
  const classesLoadState = getListLoadState(classes, loading, classesLoadFailure);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  // Filter, Sort, Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortDescending, setSortDescending] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 9; // Display 9 classes per page (3x3 grid)

  // Custom Dropdown States
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setClassesLoadFailure(null);
    try {
      const res = await classService.getAll({
        searchTerm,
        year: year === '' ? undefined : Number(year),
        sortBy,
        sortDescending,
        pageNumber,
        pageSize
      });
      setClasses(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      console.error('Failed to fetch classes', err);
      setClassesLoadFailure(classifyLoadFailure(err));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, year, sortBy, sortDescending, pageNumber, pageSize]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== UserRoles.User) {
      router.push(user?.role === UserRoles.Admin ? '/admin' : '/auth/login');
      return;
    }
    const timer = window.setTimeout(() => { void fetchClasses(); }, searchTerm.trim() ? 500 : 0);
    return () => window.clearTimeout(timer);
  }, [user, authLoading, router, fetchClasses, searchTerm]);

  const handleSaveClass = async (data: CreateClassData) => {
    try {
      const isEdit = !!editingClass;
      if (isEdit) {
        await classService.update(editingClass.id, { ...data, id: editingClass.id });
      } else {
        await classService.create(data);
      }
      setIsModalOpen(false);
      setEditingClass(null);
      setToast({
        isOpen: true,
        message: isEdit ? t('teacher.classUpdated') : t('teacher.classCreated'),
        type: 'success'
      });
      fetchClasses();
    } catch (err) {
      console.error('Failed to save class', err);
      throw err;
    }
  };

  const handleEdit = (c: Class) => {
    setEditingClass(c);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingClassId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClassId) return;
    setIsDeleting(true);
    try {
      await classService.delete(deletingClassId);
      setIsDeleteModalOpen(false);
      setDeletingClassId(null);
      setToast({ isOpen: true, message: t('teacher.classDeleted'), type: 'success' });
      fetchClasses();
    } catch (err) {
      console.error('Failed to delete class', err);
      setToast({ isOpen: true, message: mutationErrorMessage(err, t), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || !user || user.role !== UserRoles.User) return null;

  return (
    <main className="club-dashboard">
      <header className="club-hero">
        <div className="club-hero-intro"><span className="club-heading-gesture" aria-hidden="true"/><h1 className="club-headline"><span>{t('club.titleOne')}</span><span>{t('club.titleTwo')}</span></h1><div className="club-hero-action"><h2>{t('club.yourClasses')}</h2><Button onClick={() => { setEditingClass(null); setIsModalOpen(true); }}><Plus className="h-5 w-5"/>{t('club.createClass')}</Button></div></div>
        <section className="club-week" aria-label={t('club.weekSchedule')}><h2>{t('club.weekSchedule')}</h2><div className="club-week-items">{classes.flatMap(c=>(c.schedules||[]).slice(0,1).map(schedule=>({c,schedule}))).slice(0,3).map(({c,schedule},i)=><Link key={c.id} href={`/teacher/class/${c.id}`} className={`club-week-item week-tone-${i}`}><strong>{t(`days.${schedule.dayOfWeek}`)}</strong><time>{schedule.startTime.slice(0,5)} – {(()=>{const [h,m]=schedule.startTime.split(':').map(Number);const minutes=Math.round((h*60+m+schedule.durationHours*60)%1440);return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;})()}</time><span>{c.name}</span><ChevronRight className="h-4 w-4"/></Link>)}</div>{!classes.length&&<p className="club-week-empty">{loading?t('common.loading'):t('club.scheduleEmpty')}</p>}</section>
      </header>

      {/* Filters and Controls */}
      <div className="club-filter-bar relative z-30">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            aria-label={t('teacher.searchClasses')}
            placeholder={t('teacher.searchClasses')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
            className="w-full h-11 pl-12 pr-4 bg-white rounded-lg border-none focus:ring-2 focus:ring-brand-primary/20 text-sm font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Year Filter Dropdown */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              onClick={() => { setIsYearDropdownOpen(!isYearDropdownOpen); setIsSortDropdownOpen(false); }}
              className="h-11 bg-white rounded-lg px-4 flex items-center justify-between min-w-[180px] hover:bg-surface-50 transition-colors border-2 border-transparent focus:border-brand-primary/20"
            >
              <div className="flex items-center text-surface-400">
                <Filter className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium text-surface-900">
                  {year === '' ? t('teacher.allYears') : t('teacher.yearLabel', { year })}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isYearDropdownOpen && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-lg border border-surface-100 py-2 z-50 overflow-hidden"
                >
                  <button
                    onClick={() => { setYear(''); setPageNumber(1); setIsYearDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-surface-50 transition-colors ${year === '' ? 'text-brand-text bg-brand-primary/5' : 'text-surface-700'}`}
                  >
                    {t('teacher.allYears')}
                    {year === '' && <Check className="w-4 h-4" />}
                  </button>
                  {[...Array(5)].map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <button
                        key={y}
                        onClick={() => { setYear(y); setPageNumber(1); setIsYearDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-surface-50 transition-colors ${year === y ? 'text-brand-text bg-brand-primary/5' : 'text-surface-700'}`}
                      >
                        {t('teacher.yearLabel', { year: y })}
                        {year === y && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => { setIsSortDropdownOpen(!isSortDropdownOpen); setIsYearDropdownOpen(false); }}
              className="h-11 bg-white rounded-lg px-4 flex items-center justify-between min-w-[220px] hover:bg-surface-50 transition-colors border-2 border-transparent focus:border-brand-primary/20"
            >
              <div className="flex items-center text-surface-400">
                <ArrowUpDown className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium text-surface-900">
                  {sortBy === 'startDate' && sortDescending === true ? t('teacher.sortNewest') :
                   sortBy === 'startDate' && sortDescending === false ? t('teacher.sortOldest') :
                   sortBy === 'name' && sortDescending === false ? t('teacher.sortNameAscending') :
                   sortBy === 'name' && sortDescending === true ? t('teacher.sortNameDescending') :
                   sortBy === 'studentCount' && sortDescending === true ? t('teacher.sortMostStudents') :
                   t('teacher.sortFewestStudents')}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isSortDropdownOpen && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-lg border border-surface-100 py-2 z-50 overflow-hidden"
                >
                  {[
                    { label: t('teacher.sortNewest'), valSortBy: 'startDate', valDesc: true },
                    { label: t('teacher.sortOldest'), valSortBy: 'startDate', valDesc: false },
                    { label: t('teacher.sortNameAscending'), valSortBy: 'name', valDesc: false },
                    { label: t('teacher.sortNameDescending'), valSortBy: 'name', valDesc: true },
                    { label: t('teacher.sortMostStudents'), valSortBy: 'studentCount', valDesc: true },
                    { label: t('teacher.sortFewestStudents'), valSortBy: 'studentCount', valDesc: false },
                  ].map((option) => {
                    const isActive = sortBy === option.valSortBy && sortDescending === option.valDesc;
                    return (
                      <button
                        key={option.label}
                        onClick={() => {
                          setSortBy(option.valSortBy);
                          setSortDescending(option.valDesc);
                          setPageNumber(1);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-surface-50 transition-colors ${isActive ? 'text-brand-text bg-brand-primary/5' : 'text-surface-700'}`}
                      >
                        {option.label}
                        {isActive && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

        {/* Dynamic Class Cards Layout */}
        <div className="club-result-summary"><span>{t('teacher.pageEnrollmentCount')}: {getPageEnrollmentCount(classes)} {t('teacher.enrollments')}</span></div>
        <div className="club-class-grid">
          {classesLoadFailure && (
            <div role="alert" className="col-span-full flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium">
                {classesLoadFailure === 'unauthorized'
                  ? t('common.sessionExpired')
                  : classesLoadFailure === 'forbidden'
                    ? t('teacher.classesForbidden')
                    : classes.length > 0
                      ? t('teacher.classesLoadError')
                      : t('teacher.classesLoadEmptyError')}
              </p>
              {isRetryableLoadFailure(classesLoadFailure) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { void fetchClasses(); }}
                  isLoading={loading}
                  className="shrink-0 border-red-300 text-red-800 hover:bg-red-100"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />{t('common.retry')}
                </Button>
              )}
            </div>
          )}
          {classesLoadState === 'loading' ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white h-28 rounded-xl animate-pulse border border-surface-200" />
            ))
          ) : (
            <AnimatePresence>
              {classes.length > 0 && !(classesLoadFailure && !isRetryableLoadFailure(classesLoadFailure)) ? (
                classes.map((c,index) => <ClubClassCard key={c.id} data={c} index={index} onEdit={()=>handleEdit(c)} onDelete={()=>handleDeleteClick(c.id)} />)
              ) : classesLoadFailure ? null : (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full py-12 sm:py-14 text-center bg-white rounded-xl border-2 border-dashed border-surface-200"
                >
                  <div className="w-20 h-20 bg-brand-primary/5 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <BookOpen className="w-10 h-10 text-brand-primary/40" />
                  </div>
                  <h3 className="text-2xl font-semibold text-surface-900 mb-3">{t('teacher.noClasses')}</h3>
                  <p className="text-surface-500 font-medium mb-6 max-w-md mx-auto">{t('teacher.noClassesDesc')}</p>
                  <Button
                    onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
                    size="lg"
                    className="rounded-lg px-8 h-11"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    {t('teacher.createClass')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 mt-8">
            <div className="text-sm font-medium text-surface-500">
              {t('teacher.classesShowing', { start: (pageNumber - 1) * pageSize + 1, end: Math.min(pageNumber * pageSize, totalCount), total: totalCount })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(prev => prev - 1)}
                className="rounded-xl h-12 px-4 border-surface-100"
              >
                {t('teacher.previousPage')}
              </Button>
              <div className="flex items-center gap-1 hidden sm:flex">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPageNumber(i + 1)}
                    className={`w-12 h-12 rounded-xl text-sm font-semibold transition-all ${
                      pageNumber === i + 1
                        ? 'bg-brand-action text-white  '
                        : 'text-surface-500 hover:bg-surface-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                disabled={pageNumber === totalPages}
                onClick={() => setPageNumber(prev => prev + 1)}
                className="rounded-xl h-12 px-4 border-surface-100"
              >
                {t('teacher.nextPage')}
              </Button>
            </div>
          </div>
        )}

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClass}
        initialData={editingClass || undefined}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={t('teacher.deleteTitle')}
        message={t('teacher.deleteMessage')}
      />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </main>
  );
}
