'use client';

import { useState, useEffect } from 'react';
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
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { UserRoles } from '@/constants/roles';

import { classService, Class, CreateClassData } from '@/services/classService';
import ClassModal from '@/components/teacher/ClassModal';
import ConfirmModal from '@/components/teacher/ConfirmModal';

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  }, [user, authLoading]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await classService.getAll();
      setClasses(res.data);
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
    <main className="min-h-screen pb-20 relative overflow-hidden">
      {/* Decorative Organic Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 aura-bg rounded-full animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-brand-secondary/20 aura-bg rounded-full animate-float pointer-events-none" style={{ animationDelay: '-5s' }} />
      <div className="absolute top-[20%] right-[-5%] w-[20%] h-[20%] bg-brand-accent/30 aura-bg rounded-full animate-sway pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Dynamic Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-brand-primary/10 rounded-full mb-6 border border-brand-primary/10">
              <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{t('teacher.teacherSpace')}</span>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white soft-card rounded-[2rem] flex items-center justify-center shadow-xl shadow-brand-primary/10 rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                <BookOpen className="w-8 h-8 text-brand-primary" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-surface-900 tracking-tighter leading-none">
                {t('teacher.title')}
              </h1>
            </div>
            <p className="text-surface-500 text-lg font-medium max-w-xl leading-relaxed">
              {t('teacher.desc')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            {/* Quick Stats Pill */}
            <div className="hidden md:flex bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2rem] p-2 pr-6 items-center shadow-lg shadow-surface-200/20">
              <div className="w-10 h-10 bg-brand-primary text-white rounded-[1.25rem] flex items-center justify-center mr-3 shadow-lg shadow-brand-primary/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none mb-1">{t('teacher.totalImpact')}</div>
                <div className="text-lg font-black text-surface-900 leading-none">
                  {classes.reduce((acc, curr) => acc + curr.studentCount, 0)} {t('teacher.students')}
                </div>
              </div>
            </div>

            <Button 
              onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
              size="lg" 
              className="rounded-[2rem] h-16 px-10 shadow-2xl shadow-brand-primary/40 group bg-brand-primary hover:bg-brand-primary/90 transition-all duration-500 active:scale-95"
            >
              <Plus className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-700" />
              <span className="font-black tracking-tight">{t('teacher.createClass')}</span>
            </Button>
          </motion.div>
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
                          <span>{c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : 'TBA'}</span>
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
                  <h3 className="text-2xl font-black text-surface-900 mb-4">{t('teacher.noClasses')}</h3>
                  <p className="text-surface-500 font-medium mb-10 max-w-md mx-auto">Start your teaching journey by creating your first class session today.</p>
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
      </div>

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
