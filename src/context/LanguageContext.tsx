'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';

type Language = 'vi' | 'en';
type Translations = typeof vi;
type TranslationParams = Record<string, string | number>;
type Translate = (path: string, params?: TranslationParams) => string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translate;
}

const translations: Record<Language, Translations> = { vi, en };

function getTranslation(language: Language, path: string): string {
  let result: unknown = translations[language];
  for (const key of path.split('.')) {
    if (typeof result !== 'object' || result === null || !(key in result)) return path;
    result = (result as Record<string, unknown>)[key];
  }
  return typeof result === 'string' ? result : path;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      // The preference is read from browser storage after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback<Translate>((path, params) => {
    let translated = getTranslation(language, path);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Convert value to string and translate if it's a day of week
        const stringValue = String(value);
        const translatedValue = getTranslation(language, `days.${stringValue}`);
        const finalValue = translatedValue !== `days.${stringValue}` ? translatedValue : stringValue;
        translated = translated.replace(`{${key}}`, finalValue);
      });
    }

    return translated;
  }, [language]);

  const contextValue = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
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
