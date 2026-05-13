'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';

export default function AdminLoginPage() {
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
      
      // Kiểm tra xem có đúng là Admin không
      if (res.data.role !== 'ADMIN') {
        throw new Error('Unauthorized access. Admin privileges required.');
      }

      localStorage.setItem('accessToken', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data));
      router.push('/'); // Sau này chuyển sang /admin/dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Matrix-like Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-widest text-white uppercase">Admin Console</h1>
            <div className="flex items-center mt-2 text-zinc-500 space-x-2">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono">SECURE ACCESS ONLY</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Admin ID" 
              placeholder="root_id"
              className="bg-zinc-950 border-zinc-800 text-white font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input 
              label="Security Key" 
              type="password" 
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 text-white font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <p className="text-xs text-red-500 font-mono text-center">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 bg-white text-black hover:bg-zinc-200" 
              isLoading={loading}
            >
              Authenticate
            </Button>
          </form>

          <Link href="/" className="mt-8 flex items-center justify-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 mr-2" />
            Return to Public Area
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
