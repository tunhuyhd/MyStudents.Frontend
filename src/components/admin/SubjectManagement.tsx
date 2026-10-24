'use client';

import { useCallback, useState, useEffect } from 'react';
import { subjectService, Subject } from '@/services/subjectService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit2, X, Check, BookPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Toast } from '@/components/ui/Toast';
import { mutationErrorMessage } from '@/lib/mutationError';

export default function SubjectManagement() {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({ isOpen: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    }
  }, []);

  useEffect(() => {
    // Fetch the subject list; state updates follow the completed API request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSubjects();
  }, [fetchSubjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editingId) {
        await subjectService.update(editingId, { id: editingId, ...formData });
      } else {
        await subjectService.create(formData);
      }
      setFormData({ name: '', description: '' });
      setIsAdding(false);
      setEditingId(null);
      fetchSubjects();
      setToast({ isOpen: true, message: t('admin.subjectSaved'), type: 'success' });
    } catch (err) {
      console.error('Failed to save subject', err);
      setToast({ isOpen: true, message: mutationErrorMessage(err, t), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setFormData({ name: subject.name, description: subject.description });
    setEditingId(subject.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!confirm(t('admin.deleteSubjectConfirm'))) return;
    setDeletingId(id);
    try {
      await subjectService.delete(id);
      fetchSubjects();
      setToast({ isOpen: true, message: t('admin.subjectDeleted'), type: 'success' });
    } catch (err) {
      console.error('Failed to delete subject', err);
      setToast({ isOpen: true, message: mutationErrorMessage(err, t), type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-emerald-500" />
          {t('admin.subjectsTitle')}
        </h2>
        <Button 
          theme="dark"
          disabled={saving}
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({name:'', description:''}); }}
          className="rounded-2xl h-12 px-6 shadow-lg shadow-emerald-500/20"
        >
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? t('admin.cancel') : t('admin.addSubject')}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  theme="dark"
                  label={t('admin.subjectName')}
                  placeholder={t('admin.subjectNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input 
                  theme="dark"
                  label={t('admin.subjectDescription')}
                  placeholder={t('admin.subjectDescriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" theme="dark" disabled={saving} isLoading={saving} className="px-10 h-12 rounded-xl shadow-xl shadow-emerald-500/30">
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? t('admin.updateSubject') : t('admin.createSubject')}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((s) => (
          <motion.div
            key={s.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <BookPlus className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleEdit(s)}
                  aria-label={t('admin.editSubject', { name: s.name })}
                  className="p-2 bg-white/5 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  aria-label={t('admin.deleteSubject', { name: s.name })}
                  className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{s.name}</h3>
            <p className="text-emerald-300 text-sm line-clamp-2">{s.description || t('admin.noDescription')}</p>
          </motion.div>
        ))}
      </div>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast((current) => ({ ...current, isOpen: false }))} />
    </div>
  );
}
