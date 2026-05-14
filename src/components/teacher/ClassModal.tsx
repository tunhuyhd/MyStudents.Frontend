'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BookOpen, Globe, Home, ChevronDown, Search, Plus, Trash2, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Class, CreateClassData, ClassSchedule } from '@/services/classService';
import { subjectService, Subject } from '@/services/subjectService';
import { useLanguage } from '@/context/LanguageContext';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClassData) => Promise<void>;
  initialData?: Class | null;
}

const CustomDatePicker = ({ 
  label, 
  value, 
  onChange, 
  t 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  t: (key: string) => string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || Date.now()));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = new Date(value);
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  // Adjusted for Monday start if needed, but standard 0=Sun is fine
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format as YYYY-MM-DD
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onChange(adjustedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === viewDate.getMonth() && 
           today.getFullYear() === viewDate.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === viewDate.getMonth() && 
           selectedDate.getFullYear() === viewDate.getFullYear();
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 px-6 rounded-2xl bg-surface-50/50 border flex items-center justify-between cursor-pointer transition-all duration-300 ${
          isOpen ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/5' : 'border-surface-100 hover:border-brand-primary/50'
        }`}
      >
        <span className="font-bold text-surface-700">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
        <Calendar className={`w-5 h-5 transition-colors ${isOpen ? 'text-brand-primary' : 'text-surface-400'}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-40 top-full left-0 right-0 mt-2 bg-white border border-surface-100 rounded-3xl shadow-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="font-black text-surface-900 flex items-center">
                <span className="text-brand-primary mr-2 uppercase tracking-widest text-[10px]">Tháng</span>
                {viewDate.getMonth() + 1} / {viewDate.getFullYear()}
              </h4>
              <div className="flex space-x-1">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-surface-50 rounded-xl transition-colors">
                  <ChevronLeft className="w-4 h-4 text-surface-400" />
                </button>
                <button type="button" onClick={nextMonth} className="p-2 hover:bg-surface-50 rounded-xl transition-colors">
                  <ChevronRight className="w-4 h-4 text-surface-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-[10px] font-black text-surface-300 text-center py-2">{d}</div>
              ))}
              {padding.map(p => <div key={`p-${p}`} />)}
              {days.map(d => (
                <div
                  key={d}
                  onClick={() => handleSelect(d)}
                  className={`aspect-square flex items-center justify-center text-sm font-bold rounded-xl cursor-pointer transition-all ${
                    isSelected(d) 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : isToday(d)
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'hover:bg-surface-50 text-surface-600'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScheduleRow = ({ 
  schedule, 
  index, 
  updateSchedule, 
  removeSchedule, 
  t 
}: { 
  schedule: ClassSchedule, 
  index: number, 
  updateSchedule: (index: number, field: keyof Omit<ClassSchedule, 'id'>, value: any) => void,
  removeSchedule: (index: number) => void,
  t: (key: string) => string
}) => {
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const dayRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dayRef.current && !dayRef.current.contains(event.target as Node)) setIsDayOpen(false);
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) setIsTimeOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const days = [1, 2, 3, 4, 5, 6, 0];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const [currentHour, currentMinute] = schedule.startTime.split(':');

  const handleHourSelect = (h: string) => {
    updateSchedule(index, 'startTime', `${h}:${currentMinute}:00`);
  };

  const handleMinuteSelect = (m: string) => {
    updateSchedule(index, 'startTime', `${currentHour}:${m}:00`);
    setIsTimeOpen(false); // Close after picking minute as it's usually the final step
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="bg-surface-50/50 rounded-3xl p-4 border border-surface-100 group hover:bg-white hover:shadow-xl hover:shadow-surface-200/20 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Custom Day Dropdown */}
        <div className="relative w-full sm:w-48" ref={dayRef}>
          <div 
            onClick={() => setIsDayOpen(!isDayOpen)}
            className={`w-full h-12 px-5 rounded-2xl bg-white border flex items-center justify-between cursor-pointer transition-all duration-300 ${
              isDayOpen ? 'border-brand-primary shadow-lg shadow-brand-primary/5' : 'border-surface-100 hover:border-brand-primary/50'
            }`}
          >
            <span className="font-bold text-sm text-surface-700">
              {t(`teacher.modal.days.${schedule.dayOfWeek}`)}
            </span>
            <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-300 ${isDayOpen ? 'rotate-180 text-brand-primary' : ''}`} />
          </div>

          <AnimatePresence>
            {isDayOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-surface-100 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-surface-100">
                  {days.map(d => (
                    <div
                      key={d}
                      onClick={() => {
                        updateSchedule(index, 'dayOfWeek', d);
                        setIsDayOpen(false);
                      }}
                      className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-bold ${
                        schedule.dayOfWeek === d 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'hover:bg-surface-50 text-surface-600'
                      }`}
                    >
                      {t(`teacher.modal.days.${d}`)}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Time Picker */}
        <div className="flex items-center space-x-3 flex-1 w-full">
          <div className="relative flex-1" ref={timeRef}>
            <div 
              onClick={() => setIsTimeOpen(!isTimeOpen)}
              className={`w-full h-12 px-5 rounded-2xl bg-white border flex items-center space-x-4 cursor-pointer transition-all duration-300 ${
                isTimeOpen ? 'border-brand-primary shadow-lg shadow-brand-primary/5' : 'border-surface-100 hover:border-brand-primary/50'
              }`}
            >
              <Clock className={`w-4 h-4 transition-colors ${isTimeOpen ? 'text-brand-primary' : 'text-surface-400'}`} />
              <span className="font-bold text-sm text-surface-700">
                {currentHour}:{currentMinute}
              </span>
            </div>

            <AnimatePresence>
              {isTimeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-surface-100 rounded-3xl shadow-2xl overflow-hidden flex h-64"
                >
                  <div className="flex-1 overflow-y-auto p-2 scrollbar-hide border-r border-surface-50 bg-surface-50/30">
                    <div className="text-[10px] font-black text-surface-300 uppercase tracking-widest text-center py-2 mb-1">HH</div>
                    {hours.map(h => (
                      <div
                        key={h}
                        onClick={() => handleHourSelect(h)}
                        className={`py-2.5 rounded-xl cursor-pointer transition-all text-center text-sm font-bold ${
                          currentHour === h 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'hover:bg-brand-primary/5 text-surface-600'
                        }`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                    <div className="text-[10px] font-black text-surface-300 uppercase tracking-widest text-center py-2 mb-1">MM</div>
                    {minutes.map(m => (
                      <div
                        key={m}
                        onClick={() => handleMinuteSelect(m)}
                        className={`py-2.5 rounded-xl cursor-pointer transition-all text-center text-sm font-bold ${
                          currentMinute === m 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'hover:bg-brand-primary/5 text-surface-600'
                        }`}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center bg-white border border-surface-100 rounded-2xl h-12 px-4 hover:border-brand-primary/50 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/5 transition-all">
            <input 
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={schedule.durationHours}
              onChange={(e) => updateSchedule(index, 'durationHours', parseFloat(e.target.value))}
              className="w-10 text-center text-sm font-bold text-surface-700 outline-none bg-transparent"
            />
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-tighter ml-1">{t('teacher.modal.hoursAbbr') || 'giờ'}</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => removeSchedule(index)}
          className="p-3 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

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
    subjectId: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    schedules: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      if (initialData) {
        setFormData({
          name: initialData.name,
          code: initialData.code,
          category: initialData.category,
          subjectId: initialData.subjectId,
          startDate: (initialData.startDate && !initialData.startDate.startsWith('0001')) 
            ? initialData.startDate.split('T')[0] 
            : new Date().toISOString().split('T')[0],
          expectedEndDate: (initialData.expectedEndDate && !initialData.expectedEndDate.startsWith('0001')) 
            ? initialData.expectedEndDate.split('T')[0] 
            : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          schedules: initialData.schedules || []
        });
      } else {
        setFormData({ 
          name: '', 
          code: '', 
          category: 0, 
          subjectId: '',
          startDate: new Date().toISOString().split('T')[0],
          expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          schedules: []
        });
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

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedules: [
        ...formData.schedules,
        { dayOfWeek: 1, startTime: '08:00:00', durationHours: 1.5 }
      ]
    });
  };

  const removeSchedule = (index: number) => {
    setFormData({
      ...formData,
      schedules: formData.schedules.filter((_, i) => i !== index)
    });
  };

  const updateSchedule = (index: number, field: keyof Omit<ClassSchedule, 'id'>, value: any) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setFormData({ ...formData, schedules: newSchedules });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) return;
    setLoading(true);
    try {
      // Ensure time format is correct for Backend (HH:mm:ss)
      const submitData = {
        ...formData,
        schedules: formData.schedules.map(s => ({
          ...s,
          startTime: s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime
        }))
      };
      await onSave(submitData);
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
            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative z-10 overflow-hidden border border-white max-h-[90vh] flex flex-col"
          >
            <div className="p-10 flex-1 overflow-y-auto scrollbar-nature">
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

                  <CustomDatePicker 
                    label={t('teacher.modal.startDateLabel')}
                    value={formData.startDate}
                    onChange={(val) => setFormData({...formData, startDate: val})}
                    t={t}
                  />

                  <CustomDatePicker 
                    label={t('teacher.modal.endDateLabel')}
                    value={formData.expectedEndDate}
                    onChange={(val) => setFormData({...formData, expectedEndDate: val})}
                    t={t}
                  />
                </div>

                {/* Schedules Management */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-black text-surface-400 uppercase tracking-[0.2em]">
                      {t('teacher.modal.schedulesLabel')}
                    </label>
                    <button 
                      type="button"
                      onClick={addSchedule}
                      className="flex items-center space-x-2 text-xs font-black text-brand-primary hover:opacity-70 transition-opacity uppercase tracking-widest"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('teacher.modal.addSession')}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {formData.schedules.map((schedule, index) => (
                        <ScheduleRow 
                          key={index}
                          index={index}
                          schedule={schedule}
                          updateSchedule={updateSchedule}
                          removeSchedule={removeSchedule}
                          t={t}
                        />
                      ))}
                    </AnimatePresence>
                    
                    {formData.schedules.length === 0 && (
                      <div className="py-10 border-2 border-dashed border-surface-100 rounded-[2rem] flex flex-col items-center justify-center text-surface-400">
                        <Calendar className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">{t('teacher.modal.noSchedules')}</p>
                      </div>
                    )}
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
