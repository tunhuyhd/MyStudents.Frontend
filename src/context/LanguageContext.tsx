'use client';
// Refresh types for Vercel

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';

type Language = 'vi' | 'en';
type Translations = typeof vi;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (...args: any[]) => string;
}

const translations: Record<Language, Translations> = { vi, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (path: string, params?: Record<string, any>) => {
    const keys = path.split('.');
    let result: any = translations[language];

    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path;
      }
    }

    let translated = result as string;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Convert value to string and translate if it's a day of week
        const stringValue = String(value);
        const translatedValue = t(`days.${stringValue}`);
        const finalValue = translatedValue !== `days.${stringValue}` ? translatedValue : stringValue;
        translated = translated.replace(`{${key}}`, finalValue);
      });
    }

    return translated;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
