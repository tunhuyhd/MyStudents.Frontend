'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api, { getAvatarUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { IdentificationCard, Fingerprint, Save, KeyRound, Camera, Loader2, Eye, X } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import { apiErrorMessage } from '@/lib/apiError';

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

const getInitialsBg = () => '#047857';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, refreshUser, clearSession } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Profile Form State
  const [profileData, setProfileData] = useState({ fullName: '', email: '' });

  // Password Form State
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t('profile.avatarSizeLimit') || 'File size exceeds 5MB limit');

      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.avatarTypeInvalid') || 'File must be an image');

      return;
    }

    // Generate local preview URL instantly
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

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
    } catch (err: unknown) {
      setPreviewUrl(null); // Revert preview on error
      setAvatarError(apiErrorMessage(err, t, 'profile.avatarUploadFailed'));

    } finally {
      setAvatarLoading(false);
      e.target.value = ''; // Reset file input to allow selecting the same file again
    }
  };

  useEffect(() => {
    if (user) {
      // Synchronize the editable form with the authenticated profile after refresh.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({ fullName: user.fullName, email: user.email });
      // Reset previewUrl once user is refreshed with new image, so we render the CDN image
      setPreviewUrl(null);
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
    } catch (error: unknown) {
      setMessage({ text: apiErrorMessage(error, t, 'common.saveError'), type: 'error' });
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
    if (passwordData.newPassword.length < 12) {
      setMessage({ text: t('auth.passwordTooShort'), type: 'error' });
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
      clearSession();
    } catch (error: unknown) {
      setMessage({ text: apiErrorMessage(error, t, 'profile.passwordError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="club-profile min-h-screen bg-transparent">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6"><h1 className="text-3xl mb-2">{t('profile.title')}</h1><p className="text-sm text-surface-500">{t('profile.desc')}</p></header>
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white rounded-xl border border-surface-200 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-surface-100/50 p-8 border-r border-surface-100">
              <div className="flex flex-col items-center mb-10">
                {/* Premium Interactive Avatar Upload */}
                <button type="button" aria-label={t('profile.chooseNewPhoto')} className="club-avatar-control relative group w-24 h-24 mb-4 cursor-pointer" onClick={() => setShowOptionsModal(true)}>
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-primary/10 bg-white flex items-center justify-center relative">
                    {avatarLoading ? (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    ) : null}
                    {previewUrl || user.imageUrl ? (
                      <img
                        src={previewUrl || getAvatarUrl(user.imageUrl) || ''}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        style={{ background: getInitialsBg() }}
                        className="w-full h-full flex items-center justify-center text-3xl font-semibold text-white select-none"
                      >
                        {getInitials(user.fullName)}
                      </div>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="club-avatar-hover absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center text-white text-xs font-medium">
                    {t('profile.chooseNewPhoto')}
                  </div>
                  <span className="club-avatar-badge" aria-hidden="true"><Camera /></span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={avatarLoading}
                />

                {avatarError && (
                  <span className="text-xs text-red-500 font-medium text-center mb-2 animate-pulse">{avatarError}</span>
                )}

                <h2 className="text-xl font-semibold text-surface-900 text-center truncate max-w-full">{user.fullName}</h2>
                <span className="text-xs font-medium text-brand-text bg-brand-primary/10 px-3 py-1 rounded-full mt-2 tracking-normal">
                  {user.role}
                </span>
              </div>

              <div className="club-profile-nav space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  aria-pressed={activeTab==='profile'}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${
                    activeTab === 'profile' ? 'bg-white text-brand-text ' : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  <span className="club-profile-nav-icon" aria-hidden="true"><IdentificationCard /></span>
                  <span>{t('profile.title')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  aria-pressed={activeTab==='security'}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${
                    activeTab === 'security' ? 'bg-white text-brand-text ' : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  <span className="club-profile-nav-icon" aria-hidden="true"><Fingerprint /></span>
                  <span>{t('profile.security')}</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' ? (
                  <motion.div
                    key="profile"
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-semibold text-surface-900">{t('profile.title')}</h3>
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
                        readOnly
                        aria-describedby="profile-email-help"
                      />
                      <p id="profile-email-help" className="text-sm text-surface-600">{t('profile.emailLocked')}</p>
                      <Input
                        label={t('auth.username')}
                        value={user.username}
                        disabled
                        className="bg-surface-50 opacity-70 cursor-not-allowed"
                      />

                      {message.text && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-brand-text' : 'bg-red-100 text-red-600'}`}>
                          {message.text}
                        </div>
                      )}

                      <Button type="submit" className="w-full h-12" isLoading={loading}>
                        <Save className="w-5 h-5 mr-2" />
                        {t('common.save')}
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="security"
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-semibold text-surface-900">{t('profile.security')}</h3>
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
                        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-brand-text' : 'bg-red-100 text-red-600'}`}>
                          {message.text}
                        </div>
                      )}

                      <Button type="submit" className="w-full h-12" variant="secondary" isLoading={loading}>
                        <KeyRound className="w-5 h-5 mr-2" />
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
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowOptionsModal(false)}
          >
            <motion.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-xs w-full text-center border border-surface-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-semibold text-surface-900 mb-4">{t('profile.avatarTitle')}</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowViewerModal(true);
                  }}
                  className="w-full py-3 px-4 bg-surface-50 hover:bg-surface-100 active:scale-98 text-surface-700 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5 text-surface-500" />
                  {t('profile.viewAvatar')}
                </button>

                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full py-3 px-4 bg-brand-primary/10 hover:bg-brand-primary/20 active:scale-98 text-brand-text font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5 text-brand-primary" />
                  {t('profile.chooseNewPhoto')}
                </button>

                <button
                  onClick={() => setShowOptionsModal(false)}
                  className="w-full py-3 px-4 bg-transparent hover:bg-surface-50 text-surface-500 font-medium rounded-lg transition-all"
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
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowViewerModal(false)}
          >
            <button
              onClick={() => setShowViewerModal(false)}
              className="absolute top-6 right-6 p-3 bg-white hover:bg-white active:scale-95 text-white rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl max-h-[80vh] flex items-center justify-center overflow-hidden rounded-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {previewUrl || user.imageUrl ? (
                <img
                  src={previewUrl || getAvatarUrl(user.imageUrl) || ''}
                  alt={user.fullName}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                />
              ) : (
                <div
                  style={{ background: getInitialsBg() }}
                  className="w-64 h-64 md:w-64 md:h-80 rounded-xl flex items-center justify-center text-3xl md:text-8xl font-semibold text-white select-none"
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
