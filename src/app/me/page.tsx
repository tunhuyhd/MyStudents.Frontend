'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Save, KeyRound } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Profile Form State
  const [profileData, setProfileData] = useState({ fullName: '', email: '' });
  
  // Password Form State
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileData({ fullName: user.fullName, email: user.email });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/auth/profile', profileData);
      await refreshUser();
      setMessage({ text: t('common.saveSuccess') || 'Success!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: t('common.saveError') || 'Error!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: t('profile.passwordMismatch') || 'Mismatch!', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ text: t('profile.passwordSuccess') || 'Success!', type: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || t('profile.passwordError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-transparent">
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-xl border border-white overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-80 bg-surface-100/50 p-8 border-r border-surface-100">
              <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 bg-brand-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-primary/30 mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-black text-surface-900">{user.fullName}</h2>
                <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full mt-2 uppercase tracking-widest">
                  {user.role}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === 'profile' ? 'bg-white text-brand-primary shadow-md' : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>{t('profile.title')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === 'security' ? 'bg-white text-brand-primary shadow-md' : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t('profile.security')}</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 md:p-14">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' ? (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-black text-surface-900">{t('profile.title')}</h3>
                      <p className="text-surface-500 font-medium">{t('profile.desc') || 'Manage your account details'}</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <Input 
                        label={t('auth.fullName')} 
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        required
                      />
                      <Input 
                        label={t('auth.email')} 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required
                      />
                      <Input 
                        label={t('auth.username')} 
                        value={user.username}
                        disabled
                        className="bg-surface-50 opacity-70 cursor-not-allowed"
                      />
                      
                      {message.text && (
                        <div className={`p-4 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {message.text}
                        </div>
                      )}

                      <Button type="submit" className="w-full h-14" isLoading={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {t('common.save')}
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-black text-surface-900">{t('profile.security')}</h3>
                      <p className="text-surface-500 font-medium">{t('profile.securityDesc') || 'Manage your password and protection'}</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <Input 
                        label={t('profile.oldPassword')} 
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        required
                      />
                      <Input 
                        label={t('profile.newPassword')} 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        required
                      />
                      <Input 
                        label={t('profile.confirmPassword')} 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                      />

                      {message.text && (
                        <div className={`p-4 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {message.text}
                        </div>
                      )}

                      <Button type="submit" className="w-full h-14" variant="secondary" isLoading={loading}>
                        <KeyRound className="w-4 h-4 mr-2" />
                        {t('profile.changePassword')}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
