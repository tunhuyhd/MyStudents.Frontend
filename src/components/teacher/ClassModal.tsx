'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BookOpen, Globe, Home, ChevronDown, Search } from 'lucide-react';
import { Class, CreateClassData } from '@/services/classService';
import { subjectService, Subject } from '@/services/subjectService';
import { useLanguage } from '@/context/LanguageContext';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClassData) => Promise<void>;
  initialData?: Class | null;
}

export default function ClassModal({ isOpen, onClose, onSave, initialData }: ClassModalProps) {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    code: '',
    category: 0,
    subjectId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      if (initialData) {
        setFormData({
          name: initialData.name,
          code: initialData.code,
          category: initialData.category,
          subjectId: initialData.subjectId
        });
      } else {
        setFormData({ name: '', code: '', category: 0, subjectId: '' });
      }
    }
  }, [isOpen, initialData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) return;
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Failed to save class', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === formData.subjectId);
  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative z-10 overflow-hidden border border-white"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-brand-primary/10 rounded-[1.25rem] flex items-center justify-center shadow-inner shadow-brand-primary/5">
                    <BookOpen className="w-7 h-7 text-brand-primary" />
                  </div>
                  <h2 className="text-3xl font-black text-surface-900 tracking-tight">
                    {initialData ? t('teacher.modal.editTitle') : t('teacher.modal.createTitle')}
                  </h2>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-surface-50 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-surface-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label={t('teacher.modal.nameLabel')} 
                    placeholder={t('teacher.modal.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 rounded-2xl border-surface-100 focus:border-brand-primary bg-surface-50/50"
                    required
                  />
                  <Input 
                    label={t('teacher.modal.codeLabel')} 
                    placeholder={t('teacher.modal.codePlaceholder')}
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="h-14 rounded-2xl border-surface-100 focus:border-brand-primary bg-surface-50/50"
                    required
                  />
                  
                  {/* Custom Styled Dropdown for Subject */}
                  <div className="space-y-2 relative" ref={dropdownRef}>
                    <label className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] ml-1">
                      {t('teacher.modal.subjectLabel')}
                    </label>
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full h-14 px-6 rounded-2xl bg-surface-50/50 border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                        isDropdownOpen ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/5' : 'border-surface-100 hover:border-brand-primary/50'
                      }`}
                    >
                      <span className={`font-semibold ${selectedSubject ? 'text-surface-900' : 'text-surface-400'}`}>
                        {selectedSubject ? selectedSubject.name : t('teacher.modal.subjectPlaceholder')}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-surface-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-brand-primary' : ''}`} />
                    </div>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-surface-100 rounded-[2rem] shadow-2xl overflow-hidden"
                        >
                          <div className="p-3 border-b border-surface-50">
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                              <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search subject..."
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-50 border-none focus:ring-2 focus:ring-brand-primary/10 text-sm font-medium"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-surface-100">
                            {filteredSubjects.length > 0 ? (
                              filteredSubjects.map(s => (
                                <div
                                  key={s.id}
                                  onClick={() => {
                                    setFormData({...formData, subjectId: s.id});
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                                    formData.subjectId === s.id 
                                    ? 'bg-brand-primary/10 text-brand-primary' 
                                    : 'hover:bg-surface-50 text-surface-600'
                                  }`}
                                >
                                  <span className="font-bold">{s.name}</span>
                                  {formData.subjectId === s.id && <Check className="w-4 h-4" />}
                                </div>
                              ))
                            ) : (
                              <div className="py-8 text-center text-surface-400 text-sm font-medium">
                                No subjects found
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] ml-1">
                      {t('teacher.modal.categoryLabel')}
                    </label>
                    <div className="flex bg-surface-50/50 p-1.5 rounded-2xl border border-surface-100">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, category: 0})}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                          formData.category === 0 
                          ? 'bg-white text-brand-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]' 
                          : 'text-surface-400 hover:text-surface-600'
                        }`}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        {t('teacher.modal.online')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, category: 1})}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                          formData.category === 1 
                          ? 'bg-white text-brand-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)]' 
                          : 'text-surface-400 hover:text-surface-600'
                        }`}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        {t('teacher.modal.offline')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-10 border-t border-surface-50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    className="rounded-2xl px-8 h-14 border-surface-100 text-surface-500 hover:bg-surface-50"
                  >
                    {t('teacher.modal.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={loading} 
                    className="rounded-2xl px-14 h-14 shadow-2xl shadow-brand-primary/30"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {initialData ? t('teacher.modal.save') : t('teacher.modal.create')}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
