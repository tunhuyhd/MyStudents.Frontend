'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, Mail, GraduationCap, Phone, MapPin, Calendar, ChevronLeft, ChevronRight, UserCircle, Users, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
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
      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">
        {label}
      </label>
      <div className="relative group">
        <input 
          type="text"
          placeholder="DD/MM/YYYY"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`w-full h-14 md:h-16 px-6 pr-14 rounded-[1.5rem] bg-surface-50/50 border-2 text-base font-bold text-surface-900 transition-all duration-300 outline-none ${
            isOpen ? 'border-brand-primary/20 bg-white shadow-xl shadow-brand-primary/5' : 'border-transparent hover:border-brand-primary/10'
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
            className="absolute z-50 top-full left-0 right-0 mt-3 p-6 bg-white border border-surface-50 rounded-[2.5rem] shadow-2xl min-w-[320px]"
          >
            <div className="flex items-center justify-between mb-6">
              <button 
                type="button"
                onClick={() => setShowYearPicker(!showYearPicker)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-surface-50 rounded-xl transition-colors group"
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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.lastName?.trim() || !formData.firstName?.trim()) {
      setError('Vui lòng nhập đầy đủ Họ và Tên học sinh');
      return;
    }

    if (!formData.email?.trim()) {
      setError('Vui lòng nhập địa chỉ Email');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu thông tin học sinh';
      setError(message);
    } finally {
      setLoading(false);
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
          className="bg-white w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-surface-50 flex items-center justify-between bg-white relative z-20">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-[1.75rem] flex items-center justify-center shadow-sm">
                <UserCircle className="w-8 h-8 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-brand-primary tracking-tight">
                  {initialData ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}
                </h2>
                <p className="text-surface-500 font-bold text-sm mt-1">
                  {initialData ? 'Cập nhật thông tin chi tiết hồ sơ học sinh' : 'Khởi tạo hồ sơ học sinh vào danh sách quản lý'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-4 hover:bg-surface-50 rounded-2xl transition-all duration-300 group"
            >
              <X className="w-6 h-6 text-surface-300 group-hover:text-surface-900 group-hover:rotate-90 transition-all" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="font-bold text-sm leading-relaxed">{error}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
              {/* Section: Basic Info */}
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-10 h-10 bg-brand-primary/5 rounded-[1rem] flex items-center justify-center">
                    <User className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-black text-surface-900 tracking-tight">Thông tin cơ bản</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Họ & Tên đệm <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full h-14 md:h-16 px-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Tên <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="An"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full h-14 md:h-16 px-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Email <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                    <input 
                      type="email" 
                      placeholder="student@example.com"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-14 md:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <CustomDatePicker 
                    label="Ngày sinh"
                    value={formData.dateOfBirth || ''}
                    onChange={(val) => setFormData({...formData, dateOfBirth: val})}
                    t={t}
                  />

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Giới tính</label>
                    <div className="flex bg-surface-50/70 p-1.5 rounded-[1.5rem] h-14 md:h-16">
                      {[
                        { id: 0, label: 'Nam' },
                        { id: 1, label: 'Nữ' }
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setFormData({...formData, gender: g.id})}
                          className={`flex-1 rounded-[1rem] text-xs font-black transition-all duration-500 ${
                            formData.gender === g.id 
                            ? 'bg-white text-brand-primary shadow-lg shadow-brand-primary/10' 
                            : 'text-surface-400 hover:text-surface-600'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Trường học</label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="THPT Chuyên Lê Hồng Phong"
                      value={formData.school || ''}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                      className="w-full h-14 md:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Parent & Contact */}
              <div className="space-y-8">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-10 h-10 bg-brand-primary/5 rounded-[1rem] flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-black text-surface-900 tracking-tight">Phụ huynh & Liên hệ</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Họ tên phụ huynh</label>
                  <input 
                    type="text" 
                    placeholder="Nguyễn Văn B"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="w-full h-14 md:h-16 px-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">SĐT Phụ huynh</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="090..."
                        value={formData.parentPhone || ''}
                        onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                        className="w-full h-14 md:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">SĐT Học sinh</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="091..."
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-14 md:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Địa chỉ</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="123 Đường ABC, Quận X, TP. HCM"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full h-14 md:h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.5rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-bold text-surface-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Ghi chú</label>
                  <textarea 
                    className="w-full p-6 bg-surface-50/70 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-surface-300 focus:ring-0 focus:border-brand-primary/20 focus:bg-white transition-all min-h-[140px] outline-none scrollbar-hide text-surface-900"
                    placeholder="Ghi chú về học lực, tính cách hoặc lưu ý đặc biệt..."
                    value={formData.note || ''}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="p-8 md:p-12 border-t border-surface-50 bg-white/80 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-30 mt-auto">
            <button 
              onClick={onClose}
              className="rounded-[1.75rem] px-8 md:px-12 h-16 border-none font-black text-surface-400 hover:text-surface-900 uppercase tracking-widest text-xs transition-all"
            >
              Hủy bỏ
            </button>
            <Button 
              onClick={() => handleSubmit()} 
              isLoading={loading}
              className="rounded-[1.75rem] px-10 md:px-14 h-16 shadow-2xl shadow-brand-primary/20 font-black bg-brand-primary text-white uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Check className="w-5 h-5 mr-3" />
                  {initialData ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
