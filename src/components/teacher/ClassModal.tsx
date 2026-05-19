'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar as CalendarIcon, Clock, Plus, Trash2, 
  ChevronDown, BookOpen, Hash, MapPin, Globe, 
  Check, ChevronLeft, ChevronRight, Sparkles, Layout, Info, Loader2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

interface ClassSchedule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  durationHours: number;
}

interface CreateClassData {
  id?: string;
  name: string;
  code: string;
  status: number;
  category: number; // 1: Online, 2: Offline
  subjectId: string;
  startDate: string;
  expectedEndDate: string;
  schedules: ClassSchedule[];
}

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClassData) => Promise<void>;
  initialData?: any;
}

export default function ClassModal({ isOpen, onClose, onSave, initialData }: ClassModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [activeDayDropdown, setActiveDayDropdown] = useState<number | null>(null);
  const [errorPopup, setErrorPopup] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });
  
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    code: '',
    status: 1,
    category: 1,
    subjectId: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    schedules: [{ dayOfWeek: 1, startTime: '19:00:00', durationHours: 1.5 }]
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/subjects');
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        status: initialData.status || 1,
        category: initialData.category || 1,
        subjectId: initialData.subjectId || '',
        startDate: (initialData.startDate && !initialData.startDate.startsWith('0001')) 
          ? initialData.startDate.split('T')[0] 
          : new Date().toISOString().split('T')[0],
        expectedEndDate: (initialData.expectedEndDate && !initialData.expectedEndDate.startsWith('0001')) 
          ? initialData.expectedEndDate.split('T')[0] 
          : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        schedules: initialData.schedules?.length > 0 
          ? initialData.schedules.map((s: any) => ({
              ...s,
              startTime: s.startTime.length > 8 ? s.startTime.substring(0, 8) : s.startTime
            }))
          : [{ dayOfWeek: 1, startTime: '19:00:00', durationHours: 1.5 }]
      });
    } else {
      setFormData({
        name: '',
        code: '',
        status: 1,
        category: 1,
        subjectId: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        schedules: [{ dayOfWeek: 1, startTime: '19:00:00', durationHours: 1.5 }]
      });
    }
    setStep(1);
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({
        ...formData,
        schedules: formData.schedules.map(s => ({
          ...s,
          startTime: s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime
        }))
      });
    } catch (error: any) {
      console.error('Error saving class:', error);
      
      const errorData = error.response?.data;
      
      // If it's a structured business error
      if (errorData?.errorCode) {
        const translatedMessage = (t as any)(`errors.${errorData.errorCode}`, errorData.parameters);
        setErrorPopup({ isOpen: true, message: translatedMessage });
      } else {
        // Fallback for other errors
        const errorMessage = errorData?.message || error.message || t('common.saveError');
        
        if (typeof errorMessage === 'string' && (errorMessage.includes('Bạn đã có lớp học') || errorMessage.includes('trùng nhau'))) {
          setErrorPopup({ isOpen: true, message: errorMessage });
        } else {
          alert(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedules: [
        ...formData.schedules,
        { dayOfWeek: 1, startTime: '19:00:00', durationHours: 1.5 }
      ]
    });
  };

  const updateSchedule = (index: number, field: keyof ClassSchedule, value: any) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setFormData({ ...formData, schedules: newSchedules });
  };

  const removeSchedule = (index: number) => {
    if (formData.schedules.length <= 1) return;
    const newSchedules = formData.schedules.filter((_, i) => i !== index);
    setFormData({ ...formData, schedules: newSchedules });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-10">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full h-[100dvh] md:h-[85vh] md:max-h-[800px] md:max-w-5xl bg-white md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar Decor - Desktop */}
        <div className="hidden md:flex w-72 lg:w-80 bg-brand-primary/5 p-10 lg:p-12 flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-brand-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white rounded-[1.5rem] shadow-2xl shadow-brand-primary/10 flex items-center justify-center mb-8">
              <BookOpen className="w-7 h-7 text-brand-primary" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-surface-900 leading-tight mb-5 tracking-tighter">
              {initialData ? t('teacher.modal.editTitle') : t('teacher.modal.createTitle')}
            </h2>
            <p className="text-surface-500 font-bold text-xs lg:text-sm leading-relaxed max-w-[200px]">
              {t('teacher.modal.desc')}
            </p>
          </div>

          <div className="relative z-10 space-y-6 lg:space-y-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-4 lg:gap-5">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-[1.25rem] flex items-center justify-center font-black text-base lg:text-lg transition-all duration-500 ${
                  step === s ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30 scale-110' : 
                  step > s ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white text-surface-300 border border-surface-100'
                }`}>
                  {step > s ? <Check className="w-6 h-6" /> : s}
                </div>
                <div className="flex flex-col">
                  <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${step === s ? 'text-brand-primary' : 'text-surface-300'}`}>{t('teacher.modal.stepLabel')} {s}</span>
                  <span className={`text-sm lg:text-base font-black ${step === s ? 'text-surface-900' : 'text-surface-400'}`}>
                    {s === 1 ? t('teacher.modal.step1') : t('teacher.modal.step2')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden bg-white p-5 border-b border-surface-50 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-brand-primary" />
             </div>
             <div>
                <h2 className="text-lg font-black text-surface-900">
                  {initialData ? t('teacher.modal.editTitle') : t('teacher.modal.createTitle')}
                </h2>
                <div className="flex gap-1 mt-1">
                  {[1, 2].map(s => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-brand-primary' : step > s ? 'w-4 bg-green-500' : 'w-4 bg-surface-100'}`} />
                  ))}
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-50 rounded-xl">
            <X className="w-6 h-6 text-surface-400" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
          <div className="hidden md:flex justify-end p-6 lg:p-8 absolute top-0 right-0 z-20">
            <button onClick={onClose} className="p-3 hover:bg-surface-50 rounded-[1.25rem] transition-all group">
              <X className="w-6 h-6 text-surface-300 group-hover:text-surface-900 transition-all duration-300" />
            </button>
          </div>

          <div className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide min-h-0">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 lg:space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">{t('teacher.modal.nameLabel')}</label>
                      <div className="relative group">
                        <Layout className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder={t('teacher.modal.namePlaceholder')}
                          className="w-full h-14 lg:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-bold text-surface-900 transition-all outline-none placeholder:text-surface-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">{t('teacher.modal.codeLabel')}</label>
                      <div className="relative group">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                          type="text" 
                          value={formData.code}
                          onChange={e => setFormData({...formData, code: e.target.value})}
                          placeholder={t('teacher.modal.codePlaceholder')}
                          className="w-full h-14 lg:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-bold text-surface-900 transition-all outline-none uppercase placeholder:text-surface-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2 relative">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">{t('teacher.modal.subjectLabel')}</label>
                      <button 
                        onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                        className="w-full h-14 lg:h-16 px-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent hover:border-brand-primary/20 flex items-center justify-between transition-all"
                      >
                        <span className="font-bold text-surface-900 text-base lg:text-lg">
                          {subjects.find(s => s.id === formData.subjectId)?.name || t('teacher.modal.subjectPlaceholder')}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-brand-primary/40 transition-transform duration-300 ${isSubjectOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isSubjectOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 top-full left-0 right-0 mt-3 p-3 bg-white rounded-[1.75rem] shadow-2xl border border-surface-50 max-h-60 overflow-y-auto scrollbar-hide"
                          >
                            {subjects.map(s => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setFormData({...formData, subjectId: s.id});
                                  setIsSubjectOpen(false);
                                }}
                                className={`w-full p-4 rounded-xl text-left font-bold transition-all mb-1 last:mb-0 ${
                                  formData.subjectId === s.id ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-primary/5 text-surface-600'
                                }`}
                              >
                                {s.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">{t('teacher.modal.categoryLabel')}</label>
                      <div className="flex p-1.5 bg-surface-50/70 rounded-[1.5rem] h-14 lg:h-16">
                        <button 
                          onClick={() => setFormData({...formData, category: 1})}
                          className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 rounded-[1rem] font-bold text-xs lg:text-sm whitespace-nowrap px-2 lg:px-4 transition-all duration-500 ${
                            formData.category === 1 ? 'bg-white text-brand-primary shadow-lg shadow-brand-primary/10' : 'text-surface-400 hover:text-surface-600'
                          }`}
                        >
                          <Globe className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                          {t('common.online')}
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, category: 2})}
                          className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 rounded-[1rem] font-bold text-xs lg:text-sm whitespace-nowrap px-2 lg:px-4 transition-all duration-500 ${
                            formData.category === 2 ? 'bg-white text-brand-primary shadow-lg shadow-brand-primary/10' : 'text-surface-400 hover:text-surface-600'
                          }`}
                        >
                          <MapPin className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                          {t('common.offline')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {initialData && (
                    <div className="space-y-2 relative">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">{t('teacher.modal.statusLabel')}</label>
                      <button 
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        className="w-full h-14 lg:h-16 px-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent hover:border-brand-primary/20 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${
                            formData.status === 1 ? 'bg-green-500 shadow-lg shadow-green-500/30' :
                            formData.status === 2 ? 'bg-surface-300' :
                            formData.status === 3 ? 'bg-brand-primary shadow-lg shadow-brand-primary/30' :
                            'bg-red-500 shadow-lg shadow-red-500/30'
                          }`} />
                          <span className="font-bold text-surface-900 text-base lg:text-lg">
                            {formData.status === 1 ? t('teacher.status.active') : 
                             formData.status === 2 ? t('teacher.status.inactive') : 
                             formData.status === 3 ? t('teacher.status.completed') : t('teacher.status.cancelled')}
                          </span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-brand-primary/40" />
                      </button>
                      <AnimatePresence>
                        {isStatusOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 bottom-full md:bottom-auto md:top-full left-0 right-0 mb-3 md:mb-0 md:mt-3 p-3 bg-white rounded-[1.75rem] shadow-2xl border border-surface-50"
                          >
                            {[1, 2, 3, 4].map(s => (
                              <button
                                key={s}
                                onClick={() => {
                                  setFormData({...formData, status: s});
                                  setIsStatusOpen(false);
                                }}
                                className="w-full p-4 rounded-xl text-left font-bold hover:bg-surface-50 flex items-center gap-3 lg:gap-4 transition-all"
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  s === 1 ? 'bg-green-500' : s === 2 ? 'bg-surface-300' : s === 3 ? 'bg-brand-primary' : 'bg-red-500'
                                }`} />
                                {s === 1 ? t('teacher.status.active') : s === 2 ? t('teacher.status.inactive') : s === 3 ? t('teacher.status.completed') : t('teacher.status.cancelled')}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">{t('teacher.modal.startDateLabel')}</label>
                      <div className="relative group">
                        <CustomDatePicker
                          value={formData.startDate}
                          onChange={val => setFormData({...formData, startDate: val})}
                          className="w-full h-14 lg:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-bold text-surface-900 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">{t('teacher.modal.endDateLabel')}</label>
                      <div className="relative group z-40">
                        <CustomDatePicker
                          value={formData.expectedEndDate}
                          onChange={val => setFormData({...formData, expectedEndDate: val})}
                          className="w-full h-14 lg:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-bold text-surface-900 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-9 h-9 bg-brand-primary/10 rounded-[0.8rem] flex items-center justify-center">
                          <Clock className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="text-xl lg:text-2xl font-black text-surface-900 tracking-tight">{t('teacher.modal.schedulesLabel')}</h3>
                      </div>
                      <button onClick={addSchedule} className="px-5 py-2.5 bg-brand-primary text-white rounded-xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20">
                        <Plus className="w-4 h-4 inline-block mr-1.5" />
                        {t('teacher.modal.addSession')}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {formData.schedules.map((schedule, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-5 p-5 md:p-6 bg-surface-50/40 rounded-[2rem] border border-surface-50 group hover:bg-white hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500"
                          >
                            <div className="w-full flex justify-between items-center lg:hidden">
                              <span className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em] px-1">
                                {t('teacher.modal.sessionLabel')} {index + 1}
                              </span>
                              <button 
                                onClick={() => removeSchedule(index)}
                                className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="w-full lg:flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                              <div className="relative">
                                <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.15em] mb-1 px-1 block">{t('teacher.modal.dayLabel')}</label>
                                <button
                                  type="button"
                                  onClick={() => setActiveDayDropdown(activeDayDropdown === index ? null : index)}
                                  className="w-full h-12 md:h-14 px-5 bg-white rounded-xl md:rounded-2xl border-none text-xs md:text-sm font-bold text-surface-900 shadow-sm focus:ring-2 focus:ring-brand-primary/10 flex items-center justify-between transition-all"
                                >
                                  {t(`days.${schedule.dayOfWeek}`)}
                                  <ChevronDown className={`w-4 h-4 text-brand-primary/30 transition-transform duration-300 ${activeDayDropdown === index ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                  {activeDayDropdown === index && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute z-50 top-full mt-2 left-0 right-0 p-2 bg-white rounded-[1.25rem] shadow-xl border border-surface-50 max-h-48 overflow-y-auto scrollbar-hide"
                                    >
                                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => {
                                            updateSchedule(index, 'dayOfWeek', i);
                                            setActiveDayDropdown(null);
                                          }}
                                          className={`w-full p-3 rounded-lg text-left text-xs md:text-sm font-bold transition-all mb-1 last:mb-0 flex items-center justify-between ${
                                            schedule.dayOfWeek === i ? 'bg-brand-primary text-white shadow-md' : 'text-surface-700 hover:bg-brand-primary/5'
                                          }`}
                                        >
                                          {t(`days.${i}`)}
                                          {schedule.dayOfWeek === i && <Check className="w-4 h-4" />}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="relative">
                                <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.15em] mb-1 px-1 block">{t('teacher.modal.timeLabel')}</label>
                                <input 
                                  type="time" 
                                  value={schedule.startTime}
                                  onChange={e => updateSchedule(index, 'startTime', e.target.value)}
                                  className="w-full h-12 md:h-14 px-5 bg-white rounded-xl md:rounded-2xl border-none text-xs md:text-sm font-bold text-surface-900 shadow-sm focus:ring-2 focus:ring-brand-primary/10"
                                />
                              </div>
                              <div className="relative col-span-2 lg:col-span-1">
                                <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.15em] mb-1 px-1 block">{t('teacher.modal.durationLabel')}</label>
                                <div className="flex items-center bg-white rounded-xl md:rounded-2xl px-5 h-12 md:h-14 shadow-sm">
                                  <input 
                                    type="number" 
                                    step="0.5"
                                    min="0.5"
                                    value={schedule.durationHours}
                                    onChange={e => updateSchedule(index, 'durationHours', parseFloat(e.target.value))}
                                    className="w-full bg-transparent border-none text-xs md:text-sm font-bold text-surface-900 outline-none"
                                  />
                                  <span className="text-[9px] font-black text-brand-primary/40 uppercase tracking-widest ml-2 whitespace-nowrap">{t('teacher.modal.hoursAbbr')}</span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeSchedule(index)}
                              className="hidden lg:block lg:mt-4 p-3 md:p-4 text-surface-200 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-2xl transition-all group-hover:text-surface-300 shrink-0"
                            >
                              <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-6 md:p-8 lg:p-10 bg-white/80 backdrop-blur-md border-t border-surface-50 flex items-center justify-between sticky bottom-0 z-30 mt-auto shrink-0">
            {step === 1 ? (
              <div />
            ) : (
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 md:gap-3 px-4 md:px-8 h-14 md:h-16 rounded-[1.5rem] font-black text-surface-500 hover:text-surface-900 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline uppercase tracking-widest text-[10px] md:text-xs">{t('common.back')}</span>
              </button>
            )}

            <div className="flex gap-3 md:gap-4 w-full md:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none rounded-[1.5rem] px-6 md:px-10 h-14 md:h-16 border-surface-100 font-black text-surface-600 hover:bg-surface-50 uppercase tracking-widest text-[10px] md:text-xs">
                {t('teacher.modal.cancel')}
              </Button>
              {step === 1 ? (
                <Button 
                  onClick={() => setStep(2)}
                  className="flex-1 md:flex-none rounded-[1.5rem] px-8 md:px-12 h-14 md:h-16 shadow-2xl shadow-brand-primary/20 font-black group bg-brand-primary text-white uppercase tracking-widest text-[10px] md:text-xs"
                >
                  {t('teacher.modal.continue')}
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1 md:flex-none rounded-[1.5rem] px-8 md:px-12 h-14 md:h-16 shadow-2xl shadow-brand-primary/20 font-black bg-brand-primary text-white uppercase tracking-widest text-[10px] md:text-xs"
                >
                  {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : (initialData ? t('teacher.modal.save') : t('teacher.modal.create'))}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Error Popup for Schedule Overlap */}
      <AnimatePresence>
        {errorPopup.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
              onClick={() => setErrorPopup({ ...errorPopup, isOpen: false })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl -ml-12 -mb-12" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-red-500/5">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center animate-pulse">
                    <Info className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-surface-900 tracking-tight mb-4 uppercase">{t('teacher.modal.overlapTitle')}</h3>
                
                <div className="bg-surface-50 p-6 rounded-2xl border border-surface-100 mb-8 w-full">
                  <p className="text-surface-600 font-bold leading-relaxed text-sm">
                    {errorPopup.message}
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3">
                  <Button 
                    onClick={() => setErrorPopup({ ...errorPopup, isOpen: false })}
                    className="w-full h-14 rounded-2xl bg-brand-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20"
                  >
                    {t('teacher.modal.understood')}
                  </Button>
                  <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mt-2">
                    {t('teacher.modal.overlapHint')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
