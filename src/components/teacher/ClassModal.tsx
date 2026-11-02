'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Plus, Trash2, ChevronDown, BookOpen, Hash, MapPin, Globe, Check, ChevronLeft, ChevronRight, Layout, Info, Loader2 } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Class, ClassSchedule, CreateClassData as ClassPayload } from '@/services/classService';
import { mutationErrorMessage } from '@/lib/mutationError';
import { useAccessibleDialog } from '@/hooks/useAccessibleDialog';
import { canCloseDialog } from '@/lib/dialog';

interface ClassFormData extends Omit<ClassPayload, 'schedules'> {
  id?: string;
  schedules: ClassSchedule[];
}

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClassPayload) => Promise<void>;
  initialData?: Class | null;
}

export default function ClassModal({ isOpen, onClose, onSave, initialData }: ClassModalProps) {
  const { t } = useLanguage();
  const formId = useId();
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
  const errorDialogRef = useAccessibleDialog<HTMLDivElement>(errorPopup.isOpen, closeErrorPopup);

  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    code: '',
    status: 1,
    category: 0, // 0: Online, 1: Offline
    subjectId: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    schedules: [{ dayOfWeek: 1, startTime: '19:00:00', durationHours: 1.5 }]
  });
  const initialFormSnapshot = useRef('');
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, requestClose);

  function requestClose() {
    if (loading) return;
    const hasUnsavedChanges = initialFormSnapshot.current !== JSON.stringify(formData);
    if (canCloseDialog(hasUnsavedChanges, () => window.confirm(t('common.discardChanges')))) onClose();
  }

  function closeErrorPopup() {
    setErrorPopup(current => ({ ...current, isOpen: false }));
  }

  const [subjectsError, setSubjectsError] = useState('');
  const [subjectsAttempt, setSubjectsAttempt] = useState(0);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/subjects');
        if(active){setSubjects(response.data);setSubjectsError('');}
      } catch (error) {
        if(active)setSubjectsError(mutationErrorMessage(error, t));
      }
    };
    void fetchSubjects();
    return()=>{active=false;};
  }, [isOpen, subjectsAttempt, t]);

  useEffect(() => {
    if (initialData) {
      // Keep the form aligned with the selected class when the modal opens.
      const nextFormData: ClassFormData = {
        name: initialData.name || '',
        code: initialData.code || '',
        status: initialData.status || 1,
        category: initialData.category !== undefined ? initialData.category : 0,
        subjectId: initialData.subjectId || '',
        linkOnline: initialData.linkOnline || '',
        startDate: (initialData.startDate && !initialData.startDate.startsWith('0001'))
          ? initialData.startDate.split('T')[0]
          : new Date().toISOString().split('T')[0],
        expectedEndDate: (initialData.expectedEndDate && !initialData.expectedEndDate.startsWith('0001'))
          ? initialData.expectedEndDate.split('T')[0]
          : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        schedules: initialData.schedules?.length > 0
          ? initialData.schedules.map(s => ({
              ...s,
              startTime: s.startTime.length > 8 ? s.startTime.substring(0, 8) : s.startTime
            }))
          : [{ dayOfWeek: 1, startTime: '19:00:00', durationHours: 1.5 }]
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(nextFormData);
      initialFormSnapshot.current = JSON.stringify(nextFormData);
    } else {
      const nextFormData: ClassFormData = {
        name: '',
        code: '',
        status: 1,
        category: 0,
        subjectId: '',
        linkOnline: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        schedules: [{ dayOfWeek: 1, startTime: '19:00:00', durationHours: 1.5 }]
      };
      setFormData(nextFormData);
      initialFormSnapshot.current = JSON.stringify(nextFormData);
    }
    setStep(1);
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let sanitizedLink = formData.linkOnline?.trim() || '';
      if (sanitizedLink && !/^https?:\/\//i.test(sanitizedLink)) {
        sanitizedLink = `https://${sanitizedLink}`;
      }

      await onSave({
        ...formData,
        linkOnline: sanitizedLink || undefined,
        schedules: formData.schedules.map(s => ({
          ...s,
          startTime: s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime
        }))
      });
      onClose();
    } catch (error: unknown) {
      setErrorPopup({ isOpen: true, message: mutationErrorMessage(error, t) });
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

  const updateSchedule = (index: number, field: keyof ClassSchedule, value: string | number) => {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-6">
      <motion.div
        initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-surface-900/60"
        onClick={requestClose}
      />

      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={initialData ? t('teacher.modal.editTitle') : t('teacher.modal.createTitle')}
        data-dialog-focus-scope="true"
        tabIndex={-1}
        className="relative w-full h-[100dvh] md:h-[85vh] md:max-h-[800px] md:max-w-4xl bg-white md:rounded-xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar Decor - Desktop */}
        <div className="hidden md:flex w-56 lg:w-60 bg-brand-primary/5 p-6 lg:p-8 flex-col justify-between relative overflow-hidden shrink-0">

          <div className="relative z-10">
            <div className="w-14 h-12 bg-white rounded-xl flex items-center justify-center mb-8">
              <BookOpen className="w-7 h-7 text-brand-primary" />
            </div>
            <h2 className="text-2xl lg:text-2xl font-semibold text-surface-900 leading-tight mb-5 tracking-tight">
              {initialData ? t('teacher.modal.editTitle') : t('teacher.modal.createTitle')}
            </h2>
            <p className="text-surface-500 font-medium text-xs lg:text-sm leading-relaxed max-w-[200px]">
              {t('teacher.modal.desc')}
            </p>
          </div>

          <div className="relative z-10 space-y-6 lg:space-y-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-4 lg:gap-5">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-semibold text-base lg:text-lg transition-all duration-150 ${
                  step === s ? 'bg-brand-action text-white   scale-110' :
                  step > s ? 'bg-brand-action text-white  ' : 'bg-white text-surface-500 border border-surface-100'
                }`}>
                  {step > s ? <Check className="w-6 h-6" /> : s}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-semibold  tracking-normal mb-1 ${step === s ? 'text-brand-text' : 'text-surface-500'}`}>{t('teacher.modal.stepLabel')} {s}</span>
                  <span className={`text-sm lg:text-base font-semibold ${step === s ? 'text-surface-900' : 'text-surface-400'}`}>
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
                <h2 className="text-lg font-semibold text-surface-900">
                  {initialData ? t('teacher.modal.editTitle') : t('teacher.modal.createTitle')}
                </h2>
                <div className="flex gap-1 mt-1">
                  {[1, 2].map(s => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-150 ${step === s ? 'w-8 bg-brand-primary' : step > s ? 'w-4 bg-green-500' : 'w-4 bg-surface-100'}`} />
                  ))}
                </div>
             </div>
          </div>
          <button type="button" onClick={requestClose} aria-label={t('common.close')} className="h-11 w-11 shrink-0 flex items-center justify-center hover:bg-surface-50 rounded-xl">
            <X className="w-6 h-6 text-surface-400" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
          <div className="hidden md:flex shrink-0 justify-end px-6 lg:px-8 py-3">
            <button type="button" onClick={requestClose} aria-label={t('common.close')} className="h-11 w-11 shrink-0 flex items-center justify-center hover:bg-surface-50 rounded-xl transition-all group">
              <X className="w-6 h-6 text-surface-500 group-hover:text-surface-900 transition-all duration-150" />
            </button>
          </div>

          <div className="flex-1 p-6 md:p-8 lg:p-8 md:pt-0 lg:pt-0 overflow-y-auto scrollbar-hide min-h-0">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 lg:space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2">
                      <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.nameLabel')}</label>
                      <div className="relative group">
                        <Layout className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                        <input
                          id={`${formId}-name`}
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder={t('teacher.modal.namePlaceholder')}
                          className="w-full h-12 lg:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-medium text-surface-900 transition-all outline-none placeholder:text-surface-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`${formId}-code`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.codeLabel')}</label>
                      <div className="relative group">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                        <input
                          id={`${formId}-code`}
                          type="text"
                          value={formData.code}
                          onChange={e => setFormData({...formData, code: e.target.value})}
                          placeholder={t('teacher.modal.codePlaceholder')}
                          className="w-full h-12 lg:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-medium text-surface-900 transition-all outline-none placeholder:text-surface-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2 relative">
                      {subjectsError&&<div role="alert" className="text-sm text-red-700"><p>{subjectsError}</p><button type="button" className="underline min-h-11" onClick={()=>setSubjectsAttempt(v=>v+1)}>{t('common.retry')}</button></div>}
                      <span id={`${formId}-subject-label`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.subjectLabel')}</span>
                      <button
                        aria-labelledby={`${formId}-subject-label ${formId}-subject-value`}
                        onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                        className="w-full h-12 lg:h-12 px-6 bg-surface-50/70 rounded-xl border-2 border-transparent hover:border-brand-primary/20 flex items-center justify-between transition-all"
                      >
                        <span id={`${formId}-subject-value`} className="font-medium text-surface-900 text-base lg:text-lg">
                          {subjects.find(s => s.id === formData.subjectId)?.name || t('teacher.modal.subjectPlaceholder')}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-brand-primary/40 transition-transform duration-150 ${isSubjectOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isSubjectOpen && (
                          <motion.div
                            initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 top-full left-0 right-0 mt-3 p-3 bg-white rounded-xl border border-surface-50 max-h-60 overflow-y-auto scrollbar-hide"
                          >
                            {subjects.map(s => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setFormData({...formData, subjectId: s.id});
                                  setIsSubjectOpen(false);
                                }}
                                className={`w-full p-4 rounded-xl text-left font-medium transition-all mb-1 last:mb-0 ${
                                  formData.subjectId === s.id ? 'bg-brand-action text-white ' : 'hover:bg-brand-primary/5 text-surface-600'
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
                      <span id={`${formId}-category-label`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.categoryLabel')}</span>
                      <div role="group" aria-labelledby={`${formId}-category-label`} className="flex p-1.5 bg-surface-50/70 rounded-xl h-12 lg:h-12">
                        <button
                          onClick={() => setFormData({...formData, category: 0})}
                          className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 rounded-xl font-medium text-xs lg:text-sm whitespace-nowrap px-2 lg:px-4 transition-all duration-150 ${
                            formData.category === 0 ? 'bg-white text-brand-text  ' : 'text-surface-400 hover:text-surface-600'
                          }`}
                        >
                          <Globe className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                          {t('common.online')}
                        </button>
                        <button
                          onClick={() => setFormData({...formData, category: 1})}
                          className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 rounded-xl font-medium text-xs lg:text-sm whitespace-nowrap px-2 lg:px-4 transition-all duration-150 ${
                            formData.category === 1 ? 'bg-white text-brand-text  ' : 'text-surface-400 hover:text-surface-600'
                          }`}
                        >
                          <MapPin className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                          {t('common.offline')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {formData.category === 0 && (
                    <motion.div
                      initial={false}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label htmlFor={`${formId}-online-link`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.linkOnlineLabel')}</label>
                      <input
                        id={`${formId}-online-link`}
                        type="text"
                        value={formData.linkOnline || ''}
                        onChange={(e) => setFormData({...formData, linkOnline: e.target.value})}
                        className="w-full h-12 lg:h-12 px-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all text-base lg:text-lg font-medium text-surface-900 placeholder:text-surface-400 placeholder:font-medium"
                        placeholder={t('teacher.modal.linkOnlinePlaceholder')}
                      />
                    </motion.div>
                  )}

                  {initialData && (
                    <div className="space-y-2 relative">
                      <span id={`${formId}-status-label`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.statusLabel')}</span>
                      <button
                        aria-labelledby={`${formId}-status-label ${formId}-status-value`}
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        className="w-full h-12 lg:h-12 px-6 bg-surface-50/70 rounded-xl border-2 border-transparent hover:border-brand-primary/20 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${
                            formData.status === 1 ? 'bg-green-500  ' :
                            formData.status === 2 ? 'bg-surface-300' :
                            formData.status === 3 ? 'bg-brand-primary  ' :
                            'bg-red-500  '
                          }`} />
                          <span id={`${formId}-status-value`} className="font-medium text-surface-900 text-base lg:text-lg">
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
                            initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 bottom-full md:bottom-auto md:top-full left-0 right-0 mb-3 md:mb-0 md:mt-3 p-3 bg-white rounded-xl border border-surface-50"
                          >
                            {[1, 2, 3, 4].map(s => (
                              <button
                                key={s}
                                onClick={() => {
                                  setFormData({...formData, status: s});
                                  setIsStatusOpen(false);
                                }}
                                className="w-full p-4 rounded-xl text-left font-medium hover:bg-surface-50 flex items-center gap-3 lg:gap-4 transition-all"
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
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2">
                      <span id={`${formId}-start-date-label`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.startDateLabel')}</span>
                      <div role="group" aria-labelledby={`${formId}-start-date-label`} className="relative group">
                        <CustomDatePicker
                          value={formData.startDate}
                          onChange={val => setFormData({...formData, startDate: val})}
                          className="w-full h-12 lg:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-medium text-surface-900 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span id={`${formId}-end-date-label`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.modal.endDateLabel')}</span>
                      <div role="group" aria-labelledby={`${formId}-end-date-label`} className="relative group z-40">
                        <CustomDatePicker
                          value={formData.expectedEndDate}
                          onChange={val => setFormData({...formData, expectedEndDate: val})}
                          className="w-full h-12 lg:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base lg:text-lg font-medium text-surface-900 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-9 h-9 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="text-xl lg:text-2xl font-semibold text-surface-900 tracking-tight">{t('teacher.modal.schedulesLabel')}</h3>
                      </div>
                      <button onClick={addSchedule} className="px-5 py-2.5 bg-brand-action text-white rounded-xl font-semibold text-xs lg:text-xs tracking-normal hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-4 h-4 inline-block mr-1.5" />
                        {t('teacher.modal.addSession')}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {formData.schedules.map((schedule, index) => (
                          <motion.div
                            key={index}
                            initial={false}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-5 p-5 md:p-6 bg-surface-50/40 rounded-xl border border-surface-50 group hover:bg-white hover: hover: transition-all duration-150"
                          >
                            <div className="w-full flex justify-between items-center lg:hidden">
                              <span className="text-xs font-semibold text-brand-text tracking-normal px-1">
                                {t('teacher.modal.sessionLabel')} {index + 1}
                              </span>
                              <button
                                onClick={() => removeSchedule(index)}
                                className="p-2 text-surface-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="w-full lg:flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                              <div className="relative">
                                <span id={`${formId}-schedule-${index}-day-label`} className="text-xs font-semibold text-brand-text tracking-normal mb-1 px-1 block">{t('teacher.modal.dayLabel')}</span>
                                <button
                                  type="button"
                                  aria-labelledby={`${formId}-schedule-${index}-day-label ${formId}-schedule-${index}-day-value`}
                                  onClick={() => setActiveDayDropdown(activeDayDropdown === index ? null : index)}
                                  className="w-full h-12 md:h-12 px-5 bg-white rounded-xl md:rounded-lg border-none text-xs md:text-sm font-medium text-surface-900 focus:ring-2 focus:ring-brand-primary/10 flex items-center justify-between transition-all"
                                >
                                  <span id={`${formId}-schedule-${index}-day-value`}>{t(`days.${schedule.dayOfWeek}`)}</span>
                                  <ChevronDown className={`w-4 h-4 text-brand-primary/30 transition-transform duration-150 ${activeDayDropdown === index ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                  {activeDayDropdown === index && (
                                    <motion.div
                                      initial={false}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      className="absolute z-50 top-full mt-2 left-0 right-0 p-2 bg-white rounded-xl border border-surface-50 max-h-48 overflow-y-auto scrollbar-hide"
                                    >
                                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => {
                                            updateSchedule(index, 'dayOfWeek', i);
                                            setActiveDayDropdown(null);
                                          }}
                                          className={`w-full p-3 rounded-lg text-left text-xs md:text-sm font-medium transition-all mb-1 last:mb-0 flex items-center justify-between ${
                                            schedule.dayOfWeek === i ? 'bg-brand-action text-white ' : 'text-surface-700 hover:bg-brand-primary/5'
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
                                <label htmlFor={`${formId}-schedule-${index}-time`} className="text-xs font-semibold text-brand-text tracking-normal mb-1 px-1 block">{t('teacher.modal.timeLabel')}</label>
                                <input
                                  id={`${formId}-schedule-${index}-time`}
                                  type="time"
                                  value={schedule.startTime}
                                  onChange={e => updateSchedule(index, 'startTime', e.target.value)}
                                  className="w-full h-12 md:h-12 px-5 bg-white rounded-xl md:rounded-lg border-none text-xs md:text-sm font-medium text-surface-900 focus:ring-2 focus:ring-brand-primary/10"
                                />
                              </div>
                              <div className="relative col-span-2 lg:col-span-1">
                                <label htmlFor={`${formId}-schedule-${index}-duration`} className="text-xs font-semibold text-brand-text tracking-normal mb-1 px-1 block">{t('teacher.modal.durationLabel')}</label>
                                <div className="flex items-center bg-white rounded-xl md:rounded-lg px-5 h-12 md:h-12">
                                  <input
                                    id={`${formId}-schedule-${index}-duration`}
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    value={schedule.durationHours}
                                    onChange={e => updateSchedule(index, 'durationHours', parseFloat(e.target.value))}
                                    className="w-full bg-transparent border-none text-xs md:text-sm font-medium text-surface-900 outline-none"
                                  />
                                  <span className="text-xs font-semibold text-brand-text tracking-normal ml-2 whitespace-nowrap">{t('teacher.modal.hoursAbbr')}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeSchedule(index)}
                              className="hidden lg:block lg:mt-4 p-3 md:p-4 text-surface-200 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-lg transition-all group-hover:text-surface-500 shrink-0"
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
          <div className="p-6 md:p-8 lg:p-6 bg-white border-t border-surface-50 flex items-center justify-between sticky bottom-0 z-30 mt-auto shrink-0">
            {step === 1 ? (
              <div />
            ) : (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 md:gap-3 px-4 md:px-8 h-12 md:h-12 rounded-xl font-semibold text-surface-500 hover:text-surface-900 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline tracking-normal text-xs md:text-xs">{t('common.back')}</span>
              </button>
            )}

            <div className="flex gap-3 md:gap-4 w-full md:w-auto">
              <Button variant="outline" onClick={requestClose} className="flex-1 md:flex-none rounded-xl px-6 md:px-10 h-12 md:h-12 border-surface-100 font-semibold text-surface-600 hover:bg-surface-50 tracking-normal text-xs md:text-xs">
                {t('teacher.modal.cancel')}
              </Button>
              {step === 1 ? (
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1 md:flex-none rounded-xl px-8 md:px-12 h-12 md:h-12 font-semibold group bg-brand-action text-white tracking-normal text-xs md:text-xs"
                >
                  {t('teacher.modal.continue')}
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 md:flex-none rounded-xl px-8 md:px-12 h-12 md:h-12 font-semibold bg-brand-action text-white tracking-normal text-xs md:text-xs"
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
              initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-900/40"
              onClick={() => setErrorPopup({ ...errorPopup, isOpen: false })}
            />
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              ref={errorDialogRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={`${formId}-error-title`}
              aria-describedby={`${formId}-error-description`}
              data-dialog-focus-scope="true"
              tabIndex={-1}
              className="relative w-full max-w-lg bg-white rounded-xl p-6 overflow-hidden"
            >
              {/* Background Decor */}

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center mb-8">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center animate-pulse">
                    <Info className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 id={`${formId}-error-title`} className="text-2xl font-semibold text-surface-900 tracking-tight mb-4">{t('teacher.modal.overlapTitle')}</h3>

                <div className="bg-surface-50 p-6 rounded-lg border border-surface-100 mb-8 w-full">
                  <p id={`${formId}-error-description`} className="text-surface-600 font-medium leading-relaxed text-sm">
                    {errorPopup.message}
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3">
                  <Button
                    onClick={closeErrorPopup}
                    data-dialog-initial-focus="true"
                    className="w-full h-12 rounded-lg bg-brand-action text-white font-semibold tracking-normal text-xs"
                  >
                    {t('teacher.modal.understood')}
                  </Button>
                  <p className="text-xs font-semibold text-surface-500 tracking-normal mt-2">
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
