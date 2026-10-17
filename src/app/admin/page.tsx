'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import ZodiacBackground from '@/components/ZodiacBackground';
import RoleDropdown from '@/components/RoleDropdown';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, UserCog, RefreshCw, CheckCircle2, BookOpen, Loader2 } from 'lucide-react';
import SubjectManagement from '@/components/admin/SubjectManagement';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { classifyLoadFailure, getListLoadState, isRetryableLoadFailure, type LoadFailure } from '@/lib/loadFailure';
import { mutationErrorMessage } from '@/lib/mutationError';
import { Toast } from '@/components/ui/Toast';

interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
  roleId: string;
  status: number;
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
  const [usersLoading, setUsersLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [usersLoadFailure, setUsersLoadFailure] = useState<LoadFailure | null>(null);
  const [rolesLoadFailure, setRolesLoadFailure] = useState<LoadFailure | null>(null);
  const usersLoadState = getListLoadState(users, usersLoading, usersLoadFailure);
  const rolesLoadState = getListLoadState(roles, rolesLoading, rolesLoadFailure);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'subjects'>('users');
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({ isOpen: false, message: '', type: 'success' });

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersLoadFailure(null);
    try {
      const response = await api.get<UserDto[]>('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch admin users', err);
      setUsersLoadFailure(classifyLoadFailure(err));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesLoadFailure(null);
    try {
      const response = await api.get<RoleDto[]>('/admin/roles');
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch admin roles', err);
      setRolesLoadFailure(classifyLoadFailure(err));
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchRoles()]);
    setLoading(false);
  }, [fetchUsers, fetchRoles]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Admin') {
      router.push('/');
      return;
    }
    // Fetch server state; its updates are applied after the request completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [user, authLoading, router, fetchData]);

  const handleUpdateRole = async (userId: string, newRoleId: string) => {
    if (updatingId) return;
    setUpdatingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, newRoleId, {
        headers: { 'Content-Type': 'application/json' }
      });
      setLoading(true);
      await fetchData(); // Refresh data
      setToast({ isOpen: true, message: t('admin.roleUpdated'), type: 'success' });
    } catch (err) {
      console.error('Failed to update role', err);
      setToast({ isOpen: true, message: mutationErrorMessage(err, t), type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (userId: string, currentStatus: number) => {
    if (updatingId) return;
    const newStatus = currentStatus === 1 ? 2 : 1;
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        userId,
        newStatus
      });
      await fetchData();
      setToast({ isOpen: true, message: t('admin.statusUpdated'), type: 'success' });
    } catch (err) {
      console.error('Failed to update status', err);
      setToast({ isOpen: true, message: mutationErrorMessage(err, t), type: 'error' });
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
              {(usersLoadFailure || rolesLoadFailure || rolesLoadState === 'loading' || rolesLoadState === 'empty') && (
                <div className="space-y-3 p-6 pb-0">
                  {usersLoadFailure && (users.length > 0 || usersLoadFailure !== 'failed') && (
                    <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold">
                        {usersLoadFailure === 'unauthorized'
                          ? t('common.sessionExpired')
                          : usersLoadFailure === 'forbidden'
                            ? t('admin.usersForbidden')
                            : users.length > 0
                              ? t('admin.usersLoadError')
                              : t('admin.usersLoadEmptyError')}
                      </p>
                      {isRetryableLoadFailure(usersLoadFailure) && (
                        <button type="button" onClick={() => { void fetchUsers(); }} disabled={usersLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-400/30 px-4 text-sm font-bold text-red-100 hover:bg-red-500/10 disabled:opacity-50">
                          <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />{t('common.retry')}
                        </button>
                      )}
                    </div>
                  )}
                  {rolesLoadFailure && (
                    <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold">
                        {rolesLoadFailure === 'unauthorized'
                          ? t('common.sessionExpired')
                          : rolesLoadFailure === 'forbidden'
                            ? t('admin.rolesForbidden')
                            : roles.length > 0
                              ? t('admin.rolesLoadError')
                              : t('admin.rolesLoadEmptyError')}
                      </p>
                      {isRetryableLoadFailure(rolesLoadFailure) && (
                        <button type="button" onClick={() => { void fetchRoles(); }} disabled={rolesLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-400/30 px-4 text-sm font-bold text-red-100 hover:bg-red-500/10 disabled:opacity-50">
                          <RefreshCw className={`h-4 w-4 ${rolesLoading ? 'animate-spin' : ''}`} />{t('common.retry')}
                        </button>
                      )}
                    </div>
                  )}
                  {rolesLoadState === 'empty' && (
                    <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 font-semibold text-amber-200">{t('admin.rolesEmpty')}</p>
                  )}
                  {rolesLoadState === 'loading' && (
                    <p className="rounded-2xl border border-white/10 bg-white/5 p-4 font-semibold text-emerald-100/70"><Loader2 className="inline h-4 w-4 animate-spin mr-2" />{t('admin.rolesLoading')}</p>
                  )}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('admin.user')}</th>
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('auth.email')}</th>
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('admin.currentRole')}</th>
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('teacher.modal.statusLabel')}</th>
                  <th className="px-4 md:px-8 py-6 text-xs font-black text-emerald-500/40 uppercase tracking-widest">{t('admin.changeRole')}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {usersLoadState === 'loading' ? (
                    <tr><td colSpan={5} className="px-8 py-12 text-center text-emerald-300/70"><Loader2 className="inline h-5 w-5 animate-spin mr-2" />{t('common.loading')}</td></tr>
                  ) : usersLoadFailure && usersLoadFailure !== 'failed' ? (
                    <tr><td colSpan={5} className="px-8 py-12 text-center font-semibold text-red-200">{t(usersLoadFailure === 'unauthorized' ? 'common.sessionExpired' : 'admin.usersForbidden')}</td></tr>
                  ) : usersLoadFailure === 'failed' && users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-red-200">
                        <p className="mb-4 font-semibold">{t('admin.usersLoadEmptyError')}</p>
                        <button type="button" onClick={() => { void fetchUsers(); }} disabled={usersLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-400/30 px-4 font-bold text-red-100 hover:bg-red-500/10 disabled:opacity-50">
                          <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />{t('common.retry')}
                        </button>
                      </td>
                    </tr>
                  ) : usersLoadState === 'empty' ? (
                    <tr><td colSpan={5} className="px-8 py-12 text-center font-semibold text-emerald-100/70">{t('admin.usersEmpty')}</td></tr>
                  ) : users.map((u) => (
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
                        <button
                          onClick={() => handleUpdateStatus(u.id, u.status)}
                          disabled={updatingId === u.id}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            u.status === 1 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' 
                            : 'bg-white/5 text-white/40 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${u.status === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                            {u.status === 1 ? t('teacher.status.active') : t('teacher.status.inactive')}
                          </div>
                        </button>
                      </td>
                      <td className="px-4 md:px-8 py-6">
                        <div className="flex items-center">
                          <RoleDropdown 
                            roles={rolesLoadFailure && rolesLoadFailure !== 'failed' ? [] : roles}
                            currentRoleId={u.roleId}
                            onUpdate={(newRoleId) => handleUpdateRole(u.id, newRoleId)}
                            disabled={updatingId === u.id || Boolean(rolesLoadFailure && rolesLoadFailure !== 'failed')}
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
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast((current) => ({ ...current, isOpen: false }))} />
    </main>
  );
}
