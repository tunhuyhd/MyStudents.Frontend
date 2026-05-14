'use client';

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-surface-50/50 rounded-2xl p-1 border border-surface-100/50 backdrop-blur-sm">
      <button
        onClick={() => setLanguage('vi')}
        className={`flex-1 px-4 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${
          language === 'vi' 
          ? 'bg-white text-brand-primary shadow-xl shadow-brand-primary/10' 
          : 'text-surface-400 hover:text-surface-600'
        }`}
      >
        VIETNAM
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`flex-1 px-4 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${
          language === 'en' 
          ? 'bg-white text-brand-primary shadow-xl shadow-brand-primary/10' 
          : 'text-surface-400 hover:text-surface-600'
        }`}
      >
        ENGLISH
      </button>
    </div>
  );
}
