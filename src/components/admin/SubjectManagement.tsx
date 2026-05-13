'use client';

import { useState, useEffect } from 'react';
import { subjectService, Subject } from '@/services/subjectService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit2, X, Check, BookPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SubjectManagement() {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err) {
      console.error('Failed to save subject', err);
    }
  };

  const handleEdit = (subject: Subject) => {
    setFormData({ name: subject.name, description: subject.description });
    setEditingId(subject.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectService.delete(id);
      fetchSubjects();
    } catch (err) {
      console.error('Failed to delete subject', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-emerald-500" />
          Subjects List
        </h2>
        <Button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({name:'', description:''}); }}
          className="rounded-2xl h-12 px-6 shadow-lg shadow-emerald-500/20"
        >
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? 'Cancel' : 'Add New Subject'}
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
                  label="Subject Name" 
                  placeholder="e.g. Mathematics" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                  required
                />
                <Input 
                  label="Description" 
                  placeholder="Short description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="px-10 h-12 rounded-xl shadow-xl shadow-emerald-500/30">
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Subject' : 'Create Subject'}
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
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(s)} className="p-2 bg-white/5 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{s.name}</h3>
            <p className="text-emerald-500/40 text-sm line-clamp-2">{s.description || 'No description available.'}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
