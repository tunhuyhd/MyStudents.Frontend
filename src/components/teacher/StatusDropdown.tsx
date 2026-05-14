'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface StatusOption {
  value: number;
  label: string;
  color: string;
}

interface StatusDropdownProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const statusOptions: StatusOption[] = [
  { value: 1, label: 'Đang học', color: 'bg-green-100 text-green-600' },
  { value: 2, label: 'Bảo lưu', color: 'bg-surface-100 text-surface-500' },
  { value: 3, label: 'Hoàn thành', color: 'bg-brand-primary/10 text-brand-primary' },
  { value: 4, label: 'Nghỉ học', color: 'bg-red-100 text-red-500' },
];

export default function StatusDropdown({ value, onChange, disabled }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentOption = statusOptions.find(o => o.value === value) || statusOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-40" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-transparent bg-surface-50 hover:bg-white hover:border-brand-primary/20 hover:shadow-lg transition-all duration-300 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`text-[10px] font-black uppercase tracking-widest ${currentOption.color.split(' ')[1]}`}>
          {currentOption.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-surface-400 group-hover:text-brand-primary transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/90 backdrop-blur-xl border border-white rounded-[1.5rem] shadow-2xl shadow-surface-900/10 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 hover:bg-brand-primary/5 group ${value === option.value ? 'bg-brand-primary/5' : ''}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${option.color.split(' ')[1]}`}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check className="w-3.5 h-3.5 text-brand-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
