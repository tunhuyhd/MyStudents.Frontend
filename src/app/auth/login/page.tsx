'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, LogIn } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function UserLoginPage() {
  const { t } = useLanguage();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      authLogin(res.data.token, res.data.refreshToken);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6 relative overflow-hidden">
      {/* Nature-themed background orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="inline-flex items-center text-sm font-bold text-surface-500 hover:text-brand-primary mb-8 transition-all group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('common.backToHome')}
        </Link>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(16,185,129,0.1)] border border-white">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <LogIn className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('common.login')}</h1>
            <p className="text-surface-500 font-medium mt-2">{t('auth.loginDesc')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label={t('auth.username')} 
              placeholder={t('auth.username')}
              className="bg-surface-50 border-transparent focus:bg-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input 
              label={t('auth.password')} 
              type="password" 
              placeholder="••••••••"
              className="bg-surface-50 border-transparent focus:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

            <Button type="submit" className="w-full h-14 rounded-2xl shadow-xl shadow-brand-primary/40" isLoading={loading}>
              {t('common.login')}
            </Button>
          </form>

          <div className="mt-10 text-center border-t border-surface-50 pt-8">
            <p className="text-surface-500 font-medium text-sm">
              {t('auth.noAccount')}{' '}
              <Link href="/auth/register" className="text-brand-primary font-bold hover:underline underline-offset-4">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
