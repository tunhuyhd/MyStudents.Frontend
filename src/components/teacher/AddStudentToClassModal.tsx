'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { classService } from '@/services/classService';

interface AddStudentToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (studentId: string) => Promise<void>;
  classId: string;
}

export default function AddStudentToClassModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  classId 
}: AddStudentToClassModalProps) {
  const { t } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        fetchStudents();
      }
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [isOpen, searchQuery]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await classService.getAvailableStudents(classId, searchQuery);
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (id: string) => {
    setAddingId(id);
    try {
      await onAdd(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to add student', err);
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-surface-900/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-white md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-surface-50 flex items-center justify-between relative">
            <div>
              <h2 className="text-3xl font-black text-brand-primary tracking-tighter">
                {t('teacher.details.addStudent') || 'Thêm học sinh'}
              </h2>
              <p className="text-surface-500 font-bold text-sm mt-1">
                Chọn học sinh từ danh sách hệ thống để thêm vào lớp.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-surface-50 rounded-[1.25rem] transition-all group"
            >
              <X className="w-6 h-6 text-surface-300 group-hover:text-surface-900 transition-colors" />
            </button>
          </div>

          {/* Search */}
          <div className="p-8 md:px-12 md:py-8">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm tên hoặc email học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-14 pr-8 bg-surface-50/70 rounded-[1.75rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-lg font-bold text-surface-900 transition-all outline-none placeholder:text-surface-300"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-8 space-y-4 scrollbar-hide">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                <p className="text-surface-400 font-bold">Đang tải danh sách...</p>
              </div>
            ) : students.length > 0 ? (
              students.map((student) => (
                <div 
                  key={student.id}
                  className="p-6 bg-surface-50/40 rounded-[2.5rem] border border-surface-50 hover:border-brand-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-brand-primary shadow-sm group-hover:rotate-6 transition-transform">
                      {student.lastName?.substring(0, 1)}{student.firstName?.substring(0, 1)}
                    </div>
                    <div>
                      <div className="text-lg font-black text-surface-900">
                        {student.lastName} {student.firstName}
                      </div>
                      <div className="text-xs font-bold text-surface-400 uppercase tracking-widest">
                        {student.email || 'Không có email'}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleAdd(student.id)}
                    disabled={addingId === student.id}
                    className={`h-12 px-6 rounded-xl font-black transition-all text-xs uppercase tracking-widest ${
                      addingId === student.id 
                      ? 'bg-surface-100 text-surface-400' 
                      : 'bg-white text-brand-primary hover:bg-brand-primary hover:text-white shadow-lg shadow-brand-primary/5 border border-brand-primary/10'
                    }`}
                  >
                    {addingId === student.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Thêm
                      </>
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-surface-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-surface-200" />
                </div>
                <p className="text-surface-400 font-bold">Không tìm thấy học sinh phù hợp.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 md:p-12 border-t border-surface-50 bg-white/80 backdrop-blur-md sticky bottom-0 z-10 flex justify-end">
            <Button 
              onClick={onClose}
              className="rounded-[1.75rem] h-16 px-12 bg-brand-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-primary/20"
            >
              Hoàn tất
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
