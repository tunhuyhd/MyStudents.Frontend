'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Plus, 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  ChevronDown,
  Check
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { UserRoles } from '@/constants/roles';

import { classService, Class, CreateClassData } from '@/services/classService';
import ClassModal from '@/components/teacher/ClassModal';
import ConfirmModal from '@/components/teacher/ConfirmModal';

export default function TeacherDashboard() {
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRoles.User)) {
      if (user?.role === UserRoles.Admin) {
        router.push('/admin');
      } else {
        router.push('/auth/login');
      }
      return;
    }
    if (user) fetchClasses();
  }, [user, authLoading, pageNumber, year, sortBy, sortDescending]);

  // Debounced search
  useEffect(() => {
    if (!user) return;
    const delayDebounceFn = setTimeout(() => {
      if (pageNumber === 1) {
        fetchClasses();
      } else {
        setPageNumber(1); // Reset to page 1 on search will trigger fetch
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, user]);

  const fetchClasses = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClass = async (data: CreateClassData) => {
    try {
      if (editingClass) {
        await classService.update(editingClass.id, { ...data, id: editingClass.id });
      } else {
        await classService.create(data);
      }
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
      fetchClasses();
    } catch (err) {
      console.error('Failed to delete class', err);
    } finally {
      setIsDeleting(false);
      setDeletingClassId(null);
    }
  };

  if (authLoading || !user || user.role !== UserRoles.User) return null;

  return (
    <main className="min-h-screen pb-20 space-y-12 relative overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-brand-primary/10 rounded-full mb-6 border border-brand-primary/10">
            <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{t('teacher.teacherSpace')}</span>
          </div>
          
          <h1 className="text-5xl font-black text-surface-900 tracking-tighter leading-none mb-6">
            {t('teacher.title')}
          </h1>
          <p className="text-surface-500 text-lg font-medium max-w-xl">
            {t('teacher.desc')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto"
        >
          {/* Quick Stats */}
          <div className="flex bg-white border border-surface-100 rounded-3xl p-3 pr-8 items-center shadow-sm w-full sm:w-auto">
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">{t('teacher.totalImpact')}</p>
              <p className="text-xl font-black text-surface-900">
                {classes.reduce((acc, curr) => acc + curr.studentCount, 0)} {t('teacher.students.label')}
              </p>
            </div>
          </div>

          <Button 
            onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
            size="lg" 
            className="rounded-3xl h-16 px-10 shadow-xl shadow-brand-primary/20 group bg-brand-primary text-white font-black w-full sm:w-auto"
          >
            <Plus className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
            {t('teacher.createClass')}
          </Button>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white relative z-50">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input 
            type="text" 
            placeholder={t('common.search') || "Tìm kiếm lớp học, mã lớp..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 text-sm font-bold shadow-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Year Filter Dropdown */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              onClick={() => { setIsYearDropdownOpen(!isYearDropdownOpen); setIsSortDropdownOpen(false); }}
              className="h-14 bg-white rounded-2xl shadow-sm px-4 flex items-center justify-between min-w-[180px] hover:bg-surface-50 transition-colors border-2 border-transparent focus:border-brand-primary/20"
            >
              <div className="flex items-center text-surface-400">
                <Filter className="w-5 h-5 mr-3" />
                <span className="text-sm font-bold text-surface-900">
                  {year === '' ? 'Tất cả các năm' : `Năm ${year}`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isYearDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-surface-100 py-2 z-50 overflow-hidden"
                >
                  <button
                    onClick={() => { setYear(''); setPageNumber(1); setIsYearDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between hover:bg-surface-50 transition-colors ${year === '' ? 'text-brand-primary bg-brand-primary/5' : 'text-surface-700'}`}
                  >
                    Tất cả các năm
                    {year === '' && <Check className="w-4 h-4" />}
                  </button>
                  {[...Array(5)].map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <button
                        key={y}
                        onClick={() => { setYear(y); setPageNumber(1); setIsYearDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between hover:bg-surface-50 transition-colors ${year === y ? 'text-brand-primary bg-brand-primary/5' : 'text-surface-700'}`}
                      >
                        Năm {y}
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
              className="h-14 bg-white rounded-2xl shadow-sm px-4 flex items-center justify-between min-w-[220px] hover:bg-surface-50 transition-colors border-2 border-transparent focus:border-brand-primary/20"
            >
              <div className="flex items-center text-surface-400">
                <ArrowUpDown className="w-5 h-5 mr-3" />
                <span className="text-sm font-bold text-surface-900">
                  {sortBy === 'startDate' && sortDescending === true ? 'Mới nhất' :
                   sortBy === 'startDate' && sortDescending === false ? 'Cũ nhất' :
                   sortBy === 'name' && sortDescending === false ? 'Tên (A-Z)' :
                   sortBy === 'name' && sortDescending === true ? 'Tên (Z-A)' :
                   sortBy === 'studentCount' && sortDescending === true ? 'Học sinh (Nhiều nhất)' :
                   'Học sinh (Ít nhất)'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isSortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-surface-100 py-2 z-50 overflow-hidden"
                >
                  {[
                    { label: 'Mới nhất', valSortBy: 'startDate', valDesc: true },
                    { label: 'Cũ nhất', valSortBy: 'startDate', valDesc: false },
                    { label: 'Tên (A-Z)', valSortBy: 'name', valDesc: false },
                    { label: 'Tên (Z-A)', valSortBy: 'name', valDesc: true },
                    { label: 'Học sinh (Nhiều nhất)', valSortBy: 'studentCount', valDesc: true },
                    { label: 'Học sinh (Ít nhất)', valSortBy: 'studentCount', valDesc: false },
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
                        className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between hover:bg-surface-50 transition-colors ${isActive ? 'text-brand-primary bg-brand-primary/5' : 'text-surface-700'}`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm h-80 rounded-[3.5rem] animate-pulse border border-white/50" />
            ))
          ) : (
            <AnimatePresence>
              {classes.length > 0 ? (
                classes.map((c, index) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 100, 
                      damping: 15, 
                      delay: index * 0.1 
                    }}
                    whileHover={{ y: -15, scale: 1.02 }}
                    className="relative"
                  >
                    {/* Shadow Layer for Depth */}
                    <div className="absolute inset-x-6 -bottom-6 h-20 bg-brand-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-white/80 relative group overflow-hidden h-full flex flex-col">
                      {/* Floating Category Tag */}
                      <div className="absolute top-6 right-6 z-20">
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          c.category === 0 
                          ? 'bg-blue-50 text-blue-500 border border-blue-100' 
                          : 'bg-brand-primary/5 text-brand-primary border border-brand-primary/10'
                        }`}>
                          <Zap className="w-3 h-3" />
                          <span>{c.category === 0 ? t('common.online') : t('common.offline')}</span>
                        </div>
                        {/* Status Badge */}
                        <div className={`mt-2 flex items-center space-x-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                          c.status === 1 ? 'bg-green-50 text-green-600 border-green-100' :
                          c.status === 2 ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                          c.status === 3 ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 1 ? 'bg-green-500' :
                            c.status === 2 ? 'bg-yellow-500' :
                            c.status === 3 ? 'bg-brand-primary' :
                            'bg-red-500'
                          }`} />
                          <span>{
                            c.status === 1 ? t('teacher.status.active') :
                            c.status === 2 ? t('teacher.status.inactive') :
                            c.status === 3 ? t('teacher.status.completed') :
                            t('teacher.status.cancelled')
                          }</span>
                        </div>
                      </div>

                      {/* Decoration Icon */}
                      <div className="absolute -right-6 -bottom-6 opacity-[0.04] transform rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                        <BookOpen className="w-48 h-48 text-brand-primary" />
                      </div>

                      <div className="mb-8">
                        <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3 opacity-60">
                          {c.subjectName}
                        </div>
                        <h3 className="text-3xl font-black text-surface-900 mb-3 group-hover:text-brand-primary transition-colors duration-500 leading-tight">
                          {c.name}
                        </h3>
                        <div className="w-12 h-1 bg-brand-primary/10 rounded-full group-hover:w-24 transition-all duration-500" />
                      </div>

                      <div className="space-y-5 mb-10 flex-1">
                        <div className="flex items-center text-surface-600 font-bold text-sm bg-surface-50/50 p-3 rounded-2xl border border-surface-100/50">
                          <Users className="w-5 h-5 mr-3 text-brand-primary/40" />
                          <span>{c.studentCount} <span className="text-surface-400 font-medium">{t('teacher.studentCount')}</span></span>
                        </div>
                        
                        <div className="flex items-center text-surface-600 font-bold text-sm bg-surface-50/50 p-3 rounded-2xl border border-surface-100/50">
                          <Calendar className="w-5 h-5 mr-3 text-brand-primary/40" />
                          <span>{c.startDate ? new Date(c.startDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : 'TBA'}</span>
                        </div>

                        <div className="flex items-center text-surface-600 font-bold text-sm bg-surface-50/50 p-3 rounded-2xl border border-surface-100/50">
                          <Clock className="w-5 h-5 mr-3 text-brand-primary/40" />
                          <span>{c.schedules?.length || 0} <span className="text-surface-400 font-medium">{t('teacher.sessionsPerWeek')}</span></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => router.push(`/teacher/class/${c.id}`)}
                          className="flex-[2] rounded-[1.25rem] h-12 bg-surface-900 hover:bg-surface-800 text-white shadow-lg shadow-surface-900/10 group/btn px-4"
                        >
                          <Eye className="w-4 h-4 mr-2 shrink-0" />
                          <span className="font-black tracking-tight text-[11px] uppercase truncate">{t('teacher.viewClass')}</span>
                          <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                        </Button>
                        
                        <div className="flex gap-1.5 flex-1">
                          <button 
                            onClick={() => handleEdit(c)} 
                            className="flex-1 h-12 bg-white border border-surface-100 rounded-[1.25rem] flex items-center justify-center text-surface-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all hover:shadow-lg hover:shadow-brand-primary/5"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(c.id)} 
                            className="flex-1 h-12 bg-white border border-surface-100 rounded-[1.25rem] flex items-center justify-center text-surface-400 hover:text-red-500 hover:border-red-100 transition-all hover:shadow-lg hover:shadow-red-500/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full py-32 text-center bg-white/50 backdrop-blur-md rounded-[4rem] border-2 border-dashed border-surface-200"
                >
                  <div className="w-24 h-24 bg-brand-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-float">
                    <BookOpen className="w-12 h-12 text-brand-primary/40" />
                  </div>
                  <h3 className="text-2xl font-black text-surface-900 mb-4">{t('teacher.noClasses') || 'Bạn chưa có lớp học nào'}</h3>
                  <p className="text-surface-500 font-medium mb-10 max-w-md mx-auto">{t('teacher.noClassesDesc') || 'Bắt đầu hành trình giảng dạy của bạn bằng cách tạo lớp học đầu tiên ngay hôm nay.'}</p>
                  <Button 
                    onClick={() => { setEditingClass(null); setIsModalOpen(true); }} 
                    size="lg"
                    className="rounded-full px-12 h-16 shadow-2xl shadow-brand-primary/20"
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white mt-8">
            <div className="text-sm font-bold text-surface-500">
              Hiển thị <span className="text-surface-900">{(pageNumber - 1) * pageSize + 1}</span> - <span className="text-surface-900">{Math.min(pageNumber * pageSize, totalCount)}</span> trên <span className="text-surface-900">{totalCount}</span> lớp học
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(prev => prev - 1)}
                className="rounded-xl h-12 px-4 border-surface-100"
              >
                Trước
              </Button>
              <div className="flex items-center gap-1 hidden sm:flex">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPageNumber(i + 1)}
                    className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${
                      pageNumber === i + 1 
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
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
                Sau
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
        title={t('teacher.deleteTitle') || "Xóa lớp học"}
        message={t('teacher.deleteMessage') || "Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác."}
      />
    </main>
  );
}
