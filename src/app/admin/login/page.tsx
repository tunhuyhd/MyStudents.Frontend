'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ZodiacBackground from '@/components/ZodiacBackground';
import Link from 'next/link';

export default function AdminLoginPage() {
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
      const res = await api.post('/admin/login', { username, password });
      authLogin(res.data.token, res.data.refreshToken);
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Access Denied: Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020403] p-6 relative overflow-hidden">
      <ZodiacBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="inline-flex items-center text-sm font-bold text-emerald-500/50 hover:text-emerald-400 mb-8 transition-all group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('common.backToHome')}
        </Link>

        <div className="bg-[#111814]/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)] border border-emerald-500/20">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]">
              <ShieldAlert className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Admin Access</h1>
            <p className="text-emerald-500/60 font-medium mt-2 text-sm tracking-widest uppercase">Secure Terminal System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="ADMIN IDENTIFIER" 
              placeholder="Username"
              className="bg-black/50 border-emerald-500/10 text-white focus:border-emerald-500/40"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input 
              label="SECURITY KEY" 
              type="password" 
              placeholder="••••••••"
              className="bg-black/50 border-emerald-500/10 text-white focus:border-emerald-500/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]" 
              isLoading={loading}
            >
              <Lock className="w-4 h-4 mr-2" />
              Authorize Entry
            </Button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-black text-emerald-500/20 uppercase tracking-[0.3em]">
          Restricted Area - Unauthorized access is prohibited
        </p>
      </motion.div>
    </div>
  );
}
