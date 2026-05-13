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
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { UserRoles } from '@/constants/roles';

// Mock data for initial UI
const MOCK_CLASSES = [
  { id: '1', name: 'Toán 12 - Luyện thi Đại học', subject: 'Toán', schedule: 'Thứ 2, 4, 6 (18:00)', studentCount: 25 },
  { id: '2', name: 'Văn 10 - Cơ bản', subject: 'Ngữ Văn', schedule: 'Thứ 3, 5 (17:30)', studentCount: 15 },
  { id: '3', name: 'Tiếng Anh Giao tiếp', subject: 'Tiếng Anh', schedule: 'Thứ 7, CN (08:00)', studentCount: 12 },
];

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState(MOCK_CLASSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRoles.User)) {
      // If admin, they might want to see this too, but for now let's stick to teachers
      if (user?.role === UserRoles.Admin) {
        router.push('/admin');
      } else {
        router.push('/auth/login');
      }
      return;
    }
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== UserRoles.User) return null;

  return (
    <main className="min-h-screen bg-surface-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-primary" />
              </div>
              <h1 className="text-4xl font-black text-surface-900 tracking-tight">{t('teacher.title')}</h1>
            </div>
            <p className="text-surface-500 font-medium ml-15">{t('teacher.desc')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button size="lg" className="rounded-2xl h-14 px-8 shadow-xl shadow-brand-primary/20 group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              {t('teacher.createClass')}
            </Button>
          </motion.div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {classes.length > 0 ? (
              classes.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-surface-100 relative group overflow-hidden"
                >
                  {/* Subtle Background Icon */}
                  <BookOpen className="absolute -right-4 -bottom-4 w-32 h-32 text-surface-50 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform" />

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary`}>
                      {c.subject}
                    </div>
                    <button className="p-2 text-surface-400 hover:bg-surface-50 rounded-xl transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-2xl font-black text-surface-900 mb-4 group-hover:text-brand-primary transition-colors line-clamp-1">
                    {c.name}
                  </h3>

                  <div className="space-y-4 mb-8 relative z-10">
                    <div className="flex items-center text-surface-500 text-sm font-medium">
                      <Clock className="w-4 h-4 mr-3 text-brand-primary/50" />
                      {c.schedule}
                    </div>
                    <div className="flex items-center text-surface-500 text-sm font-medium">
                      <Users className="w-4 h-4 mr-3 text-brand-primary/50" />
                      {c.studentCount} {t('teacher.studentCount')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" className="flex-1 rounded-xl h-12 border-surface-100 text-surface-600 hover:bg-brand-primary/5 hover:text-brand-primary hover:border-brand-primary/20 group/btn">
                      <Eye className="w-4 h-4 mr-2" />
                      {t('teacher.viewClass')}
                      <ChevronRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="outline" className="w-12 h-12 p-0 rounded-xl border-surface-100 text-surface-400 hover:text-brand-primary hover:bg-brand-primary/5 hover:border-brand-primary/20">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-surface-200">
                <BookOpen className="w-16 h-16 text-surface-200 mx-auto mb-6" />
                <p className="text-surface-500 font-bold text-lg">{t('teacher.noClasses')}</p>
                <Button variant="outline" className="mt-6 rounded-2xl">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('teacher.createClass')}
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
