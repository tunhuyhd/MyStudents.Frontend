'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api, { getAvatarUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Save, KeyRound, Camera, Loader2, Eye, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return (first[0] + last[0]).toUpperCase();
};

const getInitialsBg = (name: string) => {
  if (!name) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h}, 80%, 60%) 0%, hsl(${(h + 40) % 360}, 85%, 50%) 100%)`;
};

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

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t('profile.avatarSizeLimit') || 'File size exceeds 5MB limit');
      setTimeout(() => setAvatarError(''), 4000);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.avatarTypeInvalid') || 'File must be an image');
      setTimeout(() => setAvatarError(''), 4000);
      return;
    }

    setAvatarLoading(true);
    setAvatarError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.put('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await refreshUser();
    } catch (err: any) {
      console.error('Failed to upload avatar', err);
      setAvatarError(t('profile.avatarUploadFailed') || 'Failed to upload avatar');
      setTimeout(() => setAvatarError(''), 4000);
    } finally {
      setAvatarLoading(false);
      e.target.value = ''; // Reset file input to allow selecting the same file again
    }
  };

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
                {/* Premium Interactive Avatar Upload */}
                <div className="relative group w-24 h-24 mb-4 cursor-pointer" onClick={() => setShowOptionsModal(true)}>
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-brand-primary/10 bg-white flex items-center justify-center shadow-lg relative">
                    {avatarLoading ? (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    ) : null}
                    {user.imageUrl ? (
                      <img 
                        src={getAvatarUrl(user.imageUrl) || ''} 
                        alt={user.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        style={{ background: getInitialsBg(user.fullName) }}
                        className="w-full h-full flex items-center justify-center text-3xl font-black text-white select-none"
                      >
                        {getInitials(user.fullName)}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                    <Camera className="w-5 h-5 mb-1 text-white" />
                    Thay ảnh
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  disabled={avatarLoading}
                />

                {avatarError && (
                  <span className="text-[10px] text-red-500 font-bold text-center mb-2 animate-pulse">{avatarError}</span>
                )}

                <h2 className="text-xl font-black text-surface-900 text-center truncate max-w-full">{user.fullName}</h2>
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
      
      {/* Choices Modal */}
      <AnimatePresence>
        {showOptionsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowOptionsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center border border-surface-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-black text-surface-900 mb-4">{t('profile.avatarTitle')}</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowViewerModal(true);
                  }}
                  className="w-full py-3 px-4 bg-surface-50 hover:bg-surface-100 active:scale-98 text-surface-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-surface-500" />
                  {t('profile.viewAvatar')}
                </button>
                
                <button 
                  onClick={() => {
                    setShowOptionsModal(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full py-3 px-4 bg-brand-primary/10 hover:bg-brand-primary/20 active:scale-98 text-brand-primary font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-brand-primary" />
                  {t('profile.chooseNewPhoto')}
                </button>
                
                <button 
                  onClick={() => setShowOptionsModal(false)}
                  className="w-full py-3 px-4 bg-transparent hover:bg-surface-50 text-surface-500 font-bold rounded-2xl transition-all"
                >
                  {t('profile.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Lightbox Modal */}
      <AnimatePresence>
        {showViewerModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setShowViewerModal(false)}
          >
            <button 
              onClick={() => setShowViewerModal(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl max-h-[80vh] flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {user.imageUrl ? (
                <img 
                  src={getAvatarUrl(user.imageUrl) || ''} 
                  alt={user.fullName} 
                  className="max-w-full max-h-[80vh] object-contain rounded-3xl"
                />
              ) : (
                <div 
                  style={{ background: getInitialsBg(user.fullName) }}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-3xl flex items-center justify-center text-6xl md:text-8xl font-black text-white shadow-2xl select-none"
                >
                  {getInitials(user.fullName)}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
