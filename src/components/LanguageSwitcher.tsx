'use client';
import { useLanguage } from '@/context/LanguageContext';
export function LanguageSwitcher({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const { language, setLanguage } = useLanguage();
  return <div className={`language-switcher inline-flex items-center rounded-lg p-1 border ${theme === 'dark' ? 'bg-white/10 border-white/25' : 'bg-surface-50 border-surface-200'}`}>
    {(['vi','en'] as const).map(value=><button key={value} type="button" onClick={()=>setLanguage(value)} aria-pressed={language===value} className={`flex-1 min-h-9 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${language===value ? 'bg-white text-brand-text' : theme==='dark' ? 'text-emerald-50 hover:bg-white/10' : 'text-surface-500 hover:text-surface-800'}`}><span className="hidden md:inline">{value==='vi'?'VI':'EN'}</span><span className="inline md:hidden">{value==='vi'?'VI':'EN'}</span></button>)}
  </div>;
}

