'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import ZodiacBackground from '@/components/ZodiacBackground';
import RoleDropdown from '@/components/RoleDropdown';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, UserCog, RefreshCw, CheckCircle2, BookOpen } from 'lucide-react';
import SubjectManagement from '@/components/admin/SubjectManagement';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
  roleId: string;
}

interface RoleDto {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'subjects'>('users');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
      router.push('/');
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRoleId: string) => {
    setUpdatingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, newRoleId, {
        headers: { 'Content-Type': 'application/json' }
      });
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to update role', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !user || user.role !== 'Admin') return null;

  return (
    <main className="min-h-screen relative overflow-hidden">
      <ZodiacBackground />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                <UserCog className="w-6 h-6 text-emerald-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t('admin.title')}</h1>
            </div>
            <p className="text-emerald-500/40 font-medium md:ml-13 text-sm md:text-base">{t('admin.desc')}</p>
          </div>
          
          <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'users' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-emerald-500/60 hover:text-emerald-400'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'subjects' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-emerald-500/60 hover:text-emerald-400'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Subjects
            </button>
          </div>

          <Button 
            onClick={fetchData} 
            variant="outline" 
            className="rounded-2xl border-brand-primary/20 text-brand-primary h-12"
            isLoading={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.refresh')}
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-[#111814]/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('admin.user')}</th>
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('auth.email')}</th>
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('admin.currentRole')}</th>
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('admin.changeRole')}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/[0.02] hover:bg-emerald-500/[0.03] transition-colors group"
                    >
                      <td className="px-4 md:px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)] shrink-0">
                            <Users className="w-5 h-5 text-emerald-500 group-hover:text-black" />
                          </div>
                          <div>
                            <div className="font-bold text-white truncate max-w-[120px] md:max-w-none">{u.fullName}</div>
                            <div className="text-sm text-emerald-500/40 truncate max-w-[100px] md:max-w-none">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-6 text-white/70 font-medium truncate max-w-[150px] md:max-w-none">{u.email}</td>
                      <td className="px-4 md:px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          u.roleName === 'Admin' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' 
                          : 'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {u.roleName}
                        </span>
                      </td>
                      <td className="px-4 md:px-8 py-6">
                        <div className="flex items-center">
                          <RoleDropdown 
                            roles={roles}
                            currentRoleId={u.roleId}
                            onUpdate={(newRoleId) => handleUpdateRole(u.id, newRoleId)}
                            disabled={updatingId === u.id}
                          />
                          {updatingId === u.id && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="ml-3"
                            >
                              <RefreshCw className="w-4 h-4 text-emerald-500" />
                            </motion.div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            </div>
            </motion.div>
          ) : (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SubjectManagement />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
