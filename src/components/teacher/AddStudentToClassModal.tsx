'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { studentService, Student } from '@/services/studentService';

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

  const filteredStudents = students; // Filtering now handled by backend

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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-surface-900/40 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-surface-50 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-surface-900 tracking-tighter">
                {t('teacher.details.addStudent') || 'Thêm học sinh'}
              </h2>
              <p className="text-surface-400 font-medium text-sm mt-1">
                Chọn học sinh từ danh sách hệ thống để thêm vào lớp.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-50 text-surface-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-8 md:p-10 pb-4">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm tên hoặc email học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-16 pr-8 bg-surface-50 border-none rounded-2xl text-base font-bold placeholder:text-surface-300 focus:ring-4 focus:ring-brand-primary/10 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 pt-4 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                <p className="text-surface-400 font-bold">Đang tải danh sách...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  className="p-6 bg-surface-50 rounded-3xl border border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-xl transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                      {student.lastName.substring(0, 1)}{student.firstName.substring(0, 1)}
                    </div>
                    <div>
                      <div className="text-lg font-black text-surface-900">
                        {student.lastName} {student.firstName}
                      </div>
                      <div className="text-sm font-medium text-surface-400">
                        {student.email || 'Không có email'}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleAdd(student.id)}
                    disabled={addingId === student.id}
                    className={`h-12 px-6 rounded-xl font-black transition-all ${
                      addingId === student.id 
                      ? 'bg-surface-100 text-surface-400' 
                      : 'bg-white text-brand-primary hover:bg-brand-primary hover:text-white shadow-sm'
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
                <div className="w-20 h-20 bg-surface-50 rounded-[2rem] flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-surface-200" />
                </div>
                <p className="text-surface-400 font-bold">Không tìm thấy học sinh phù hợp.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 md:p-10 border-t border-surface-50 bg-surface-50/30 flex justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-2xl h-14 px-10 border-surface-200 text-surface-600 hover:bg-white"
            >
              Hoàn tất
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
