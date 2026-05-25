'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function ResetPasswordContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Kiểm tra tính hợp lệ của token ngay khi tải trang
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsValidating(false);
        return;
      }

      try {
        await api.get(`/auth/reset-password/validate?token=${token}`);
        setIsValidToken(true);
      } catch {
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || t('profile.passwordError'));
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
        <p className="text-surface-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-6"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-surface-900 tracking-tight mb-3">Liên kết không hợp lệ</h2>
        <p className="text-surface-500 font-medium mb-8 max-w-sm">
          {t('auth.invalidToken')}
        </p>
        <Link href="/auth/forgot-password" className="w-full">
          <Button className="w-full h-14 rounded-2xl shadow-xl shadow-brand-primary/40">
            {t('auth.requestNewLink')}
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      {!success ? (
        <>
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('auth.resetPassword')}</h1>
            <p className="text-surface-500 font-medium mt-2">{t('auth.resetPasswordDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label={t('auth.newPassword')} 
              type="password"
              placeholder="••••••••"
              className="bg-surface-50 border-transparent focus:bg-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input 
              label={t('auth.confirmPassword')} 
              type="password"
              placeholder="••••••••"
              className="bg-surface-50 border-transparent focus:bg-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

            <Button type="submit" className="w-full h-14 rounded-2xl shadow-xl shadow-brand-primary/40" isLoading={loading}>
              {t('auth.resetPassword')}
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
          <h2 className="text-2xl font-black text-surface-900 tracking-tight mb-4">{t('profile.passwordSuccess')}</h2>
          <p className="text-surface-500 font-medium mb-8">
            Mật khẩu của bạn đã được cập nhật thành công. Đang chuyển hướng bạn đến trang đăng nhập trong giây lát...
          </p>
          <Link href="/auth/login" className="w-full">
            <Button className="w-full h-14 rounded-2xl shadow-xl shadow-brand-primary/40">
              {t('common.login')}
            </Button>
          </Link>
        </motion.div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

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
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
              <p className="text-surface-500 font-medium">{t('common.loading')}</p>
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
