'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || t('common.saveError'));
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
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/auth/login" className="inline-flex items-center text-sm font-bold text-surface-500 hover:text-brand-primary mb-8 transition-all group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('auth.backToLogin')}
        </Link>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(16,185,129,0.1)] border border-white">
          {!success ? (
            <>
              <div className="flex flex-col items-center mb-10 text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <KeyRound className="w-8 h-8 text-brand-primary" />
                </div>
                <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('auth.forgotPassword')}</h1>
                <p className="text-surface-500 font-medium mt-2">{t('auth.forgotPasswordDesc')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label={t('auth.email')} 
                  type="email"
                  placeholder="your-email@example.com"
                  className="bg-surface-50 border-transparent focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

                <Button type="submit" className="w-full h-14 rounded-2xl shadow-xl shadow-brand-primary/40" isLoading={loading}>
                  {t('auth.sendResetLink')}
                </Button>
              </form>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-6"
            >
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight mb-4">Đã gửi email khôi phục</h2>
              <p className="text-surface-500 font-medium mb-8">
                {t('auth.forgotPasswordSuccess')}
              </p>
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full h-14 rounded-2xl">
                  {t('auth.backToLogin')}
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
