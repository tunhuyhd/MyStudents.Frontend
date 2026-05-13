'use client';

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-surface-100 rounded-full p-1 border border-surface-200">
      <button
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
          language === 'vi' ? 'bg-white text-brand-primary shadow-sm' : 'text-surface-500'
        }`}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
          language === 'en' ? 'bg-white text-brand-primary shadow-sm' : 'text-surface-500'
        }`}
      >
        EN
      </button>
    </div>
  );
}
