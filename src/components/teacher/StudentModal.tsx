'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, Mail, GraduationCap, Phone, MapPin, Calendar, ChevronLeft, ChevronRight, UserCircle, Users, ChevronDown } from 'lucide-react';
import { Student, CreateStudentData } from '@/services/studentService';
import { useLanguage } from '@/context/LanguageContext';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateStudentData) => Promise<void>;
  initialData?: Student | null;
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
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [inputValue, setInputValue] = useState(value ? new Date(value).toLocaleDateString('vi-VN') : '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(new Date(value).toLocaleDateString('vi-VN'));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Try to parse DD/MM/YYYY
    const parts = val.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900 && year < 2100) {
        const date = new Date(year, month, day);
        if (date.getDate() === day && date.getMonth() === month) {
          const offset = date.getTimezoneOffset();
          const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
          onChange(adjustedDate.toISOString().split('T')[0]);
          setViewDate(date);
        }
      }
    }
  };

  const selectedDate = value ? new Date(value) : null;
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onChange(adjustedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const years = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <div className="relative group">
        <input 
          type="text"
          placeholder="DD/MM/YYYY"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`w-full h-14 px-6 pr-14 rounded-2xl bg-surface-50/50 border text-sm font-bold text-surface-700 transition-all duration-300 outline-none ${
            isOpen ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/5' : 'border-surface-100 hover:border-brand-primary/50'
          }`}
        />
        <Calendar 
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer transition-colors ${isOpen ? 'text-brand-primary' : 'text-surface-400'}`} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 p-6 bg-white border border-surface-100 rounded-[2rem] shadow-2xl overflow-hidden min-w-[320px]"
          >
            <div className="flex items-center justify-between mb-6">
              <button 
                type="button"
                onClick={() => setShowYearPicker(!showYearPicker)}
                className="flex items-center space-x-2 px-3 py-1 hover:bg-surface-50 rounded-xl transition-colors group"
              >
                <h4 className="font-black text-surface-900 group-hover:text-brand-primary transition-colors text-lg">
                  {viewDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                </h4>
                <ChevronDown className={`w-4 h-4 text-surface-400 group-hover:text-brand-primary transition-all ${showYearPicker ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex space-x-2">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-surface-50 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5 text-surface-400" />
                </button>
                <button type="button" onClick={nextMonth} className="p-2 hover:bg-surface-50 rounded-xl transition-colors">
                  <ChevronRight className="w-5 h-5 text-surface-400" />
                </button>
              </div>
            </div>

            {showYearPicker ? (
              <div className="grid grid-cols-3 gap-2 h-64 overflow-y-auto scrollbar-hide p-2">
                {years.map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleYearSelect(y)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${
                      y === viewDate.getFullYear()
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                      : 'hover:bg-brand-primary/5 text-surface-600'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-surface-300 uppercase py-2">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {padding.map(p => <div key={`p-${p}`} />)}
                  {days.map(d => {
                    const isSelected = selectedDate?.getDate() === d && 
                                      selectedDate?.getMonth() === viewDate.getMonth() && 
                                      selectedDate?.getFullYear() === viewDate.getFullYear();
                    
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSelect(d)}
                        className={`h-10 rounded-xl text-sm font-bold transition-all ${
                          isSelected 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'hover:bg-brand-primary/5 text-surface-600'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function StudentModal({ isOpen, onClose, onSave, initialData }: StudentModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateStudentData>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: 0,
    school: '',
    parentName: '',
    parentPhone: '',
    phone: '',
    address: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email || '',
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
        gender: initialData.gender,
        school: initialData.school || '',
        parentName: initialData.parentName || '',
        parentPhone: initialData.parentPhone || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        note: initialData.note || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 0,
        school: '',
        parentName: '',
        parentPhone: '',
        phone: '',
        address: '',
        note: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] relative z-10 overflow-hidden border border-white flex flex-col"
          >
            {/* Header */}
            <div className="p-8 md:p-10 border-b border-surface-50 flex items-center justify-between bg-white/50 backdrop-blur-xl">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-[1.5rem] flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-surface-900 tracking-tight">
                    {initialData ? t('teacher.students.editTitle') || 'Chỉnh sửa học sinh' : t('teacher.students.createTitle') || 'Thêm học sinh mới'}
                  </h2>
                  <p className="text-surface-400 font-medium">
                    {initialData ? t('teacher.students.editDesc') || 'Cập nhật thông tin chi tiết hồ sơ học sinh' : t('teacher.students.createDesc') || 'Khởi tạo hồ sơ học sinh vào danh sách quản lý'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-4 hover:bg-surface-50 rounded-2xl transition-all duration-300 group"
              >
                <X className="w-6 h-6 text-surface-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Section: Basic Info */}
                <div className="space-y-8">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">{t('teacher.students.basicInfo') || 'Thông tin cơ bản'}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label={t('auth.lastName') || 'Họ & Tên đệm'}
                      placeholder="Nguyễn Văn"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                    <Input 
                      label={t('auth.firstName') || 'Tên'}
                      placeholder="An"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>

                  <Input 
                    label={t('auth.email') || 'Email'}
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    icon={<Mail className="w-4 h-4" />}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomDatePicker 
                      label={t('teacher.students.dob') || 'Ngày sinh'}
                      value={formData.dateOfBirth || ''}
                      onChange={(val) => setFormData({...formData, dateOfBirth: val})}
                      t={t}
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] ml-1">
                        {t('teacher.students.gender') || 'Giới tính'}
                      </label>
                      <div className="flex bg-surface-50/50 p-1.5 rounded-2xl border border-surface-100">
                        {[
                          { id: 0, label: t('teacher.students.male') || 'Nam' },
                          { id: 1, label: t('teacher.students.female') || 'Nữ' }
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setFormData({...formData, gender: g.id})}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                              formData.gender === g.id 
                              ? 'bg-white text-brand-primary shadow-sm' 
                              : 'text-surface-400 hover:text-surface-600'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Input 
                    label={t('teacher.students.school') || 'Trường học'}
                    placeholder="THPT Chuyên Lê Hồng Phong"
                    value={formData.school || ''}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    icon={<GraduationCap className="w-4 h-4" />}
                  />
                </div>

                {/* Section: Parent & Contact */}
                <div className="space-y-8">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">{t('teacher.students.parentContact') || 'Phụ huynh & Liên hệ'}</h3>
                  </div>

                  <Input 
                    label={t('teacher.students.parentName') || 'Họ tên phụ huynh'}
                    placeholder="Nguyễn Văn B"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label={t('teacher.students.parentPhone') || 'SĐT Phụ huynh'}
                      placeholder="090..."
                      value={formData.parentPhone || ''}
                      onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      icon={<Phone className="w-4 h-4" />}
                    />
                    <Input 
                      label={t('teacher.students.phone') || 'SĐT Học sinh'}
                      placeholder="091..."
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      icon={<Phone className="w-4 h-4" />}
                    />
                  </div>

                  <Input 
                    label={t('teacher.students.address') || 'Địa chỉ'}
                    placeholder="123 Đường ABC, Quận X, TP. HCM"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    icon={<MapPin className="w-4 h-4" />}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] ml-1">
                      {t('teacher.students.note') || 'Ghi chú'}
                    </label>
                    <textarea 
                      className="w-full p-6 bg-surface-50/50 border border-surface-100 rounded-[2rem] text-sm font-medium placeholder:text-surface-300 focus:ring-2 focus:ring-brand-primary/20 focus:bg-white focus:border-brand-primary/50 transition-all min-h-[120px] outline-none scrollbar-hide"
                      placeholder="Ghi chú về học lực, tính cách hoặc lưu ý đặc biệt..."
                      value={formData.note || ''}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 pt-8 border-t border-surface-50 flex items-center justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="rounded-2xl px-8 h-14 border-surface-100 text-surface-500 font-bold hover:bg-surface-50"
                >
                  {t('teacher.modal.cancel') || 'Hủy bỏ'}
                </Button>
                <Button 
                  type="submit" 
                  isLoading={loading}
                  className="rounded-2xl px-12 h-14 bg-brand-primary hover:bg-brand-primary/90 shadow-xl shadow-brand-primary/20 text-white font-black"
                >
                  <Check className="w-5 h-5 mr-3" />
                  {initialData ? t('teacher.modal.save') || 'Lưu thay đổi' : t('teacher.modal.create') || 'Tạo hồ sơ'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
