'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDatePicker({ value, onChange, placeholder, className }: CustomDatePickerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 is Sunday
  
  // Adjust so Monday is 0, Sunday is 6
  const startingEmptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    // Format YYYY-MM-DD correctly avoiding timezone shifts
    const m = currentMonth.getMonth() + 1;
    const y = currentMonth.getFullYear();
    const mm = m < 10 ? `0${m}` : `${m}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    onChange(`${y}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const selectedDateObj = value ? new Date(value) : null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center text-left ${className}`}
      >
        <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
        <span className="truncate w-full pl-2">
          {value ? formatDate(value) : (placeholder || t('common.selectDate'))}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-surface-100 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrevMonth}
                type="button"
                className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center text-surface-600 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-black text-surface-900 uppercase tracking-widest">
                {t('common.month')} {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
              </div>
              <button 
                onClick={handleNextMonth}
                type="button"
                className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center text-surface-600 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {[1, 2, 3, 4, 5, 6, 0].map(d => (
                <div key={d} className="text-[10px] font-black text-surface-400 py-1">{t(`days.short.${d}`)}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingEmptyCells }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDateObj && 
                  selectedDateObj.getDate() === day && 
                  selectedDateObj.getMonth() === currentMonth.getMonth() &&
                  selectedDateObj.getFullYear() === currentMonth.getFullYear();
                
                const isToday = new Date().getDate() === day && 
                  new Date().getMonth() === currentMonth.getMonth() &&
                  new Date().getFullYear() === currentMonth.getFullYear();

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    className={`h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30' 
                        : isToday
                        ? 'text-brand-primary bg-brand-primary/10'
                        : 'text-surface-700 hover:bg-surface-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
