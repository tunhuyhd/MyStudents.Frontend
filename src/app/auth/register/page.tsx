'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function RegisterPage() {
  const { t } = useLanguage();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', formData);
      authLogin(res.data.token, res.data.refreshToken);
      window.location.href = '/teacher';
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6 relative overflow-hidden">
      {/* Nature background decorative */}
      <div className="absolute top-0 right-0 w-full h-full opacity-50 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <Link href="/" className="inline-flex items-center text-sm font-bold text-surface-500 hover:text-brand-primary mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('common.backToHome')}
        </Link>

        <div className="bg-white p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(16,185,129,0.1)] border border-white">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <UserPlus className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('common.register')}</h1>
            <p className="text-surface-500 font-medium mt-2">{t('auth.createAccount')}</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input 
                label={t('auth.fullName')} 
                placeholder="Ex: John Smith"
                className="bg-surface-50 border-transparent focus:bg-white"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <Input 
              label={t('auth.username')} 
              placeholder="jsmith88"
              className="bg-surface-50 border-transparent focus:bg-white"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <Input 
              label={t('auth.email')} 
              type="email" 
              placeholder="john@example.com"
              className="bg-surface-50 border-transparent focus:bg-white"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <div className="md:col-span-2">
              <Input 
                label={t('auth.password')} 
                type="password" 
                placeholder="••••••••"
                className="bg-surface-50 border-transparent focus:bg-white"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {error && <p className="md:col-span-2 text-sm text-red-500 font-bold text-center">{error}</p>}

            <Button type="submit" className="md:col-span-2 h-14 rounded-2xl shadow-xl shadow-brand-primary/40" isLoading={loading}>
              {t('common.register')}
            </Button>
          </form>

          <div className="mt-10 text-center border-t border-surface-50 pt-8">
            <p className="text-surface-500 font-medium text-sm">
              {t('auth.haveAccount')}{' '}
              <Link href="/auth/login" className="text-brand-primary font-bold hover:underline underline-offset-4">
                {t('common.login')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
