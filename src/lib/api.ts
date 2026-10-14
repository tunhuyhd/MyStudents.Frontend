import { createApiClient } from './createApiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7287';
const storage = {
  getItem: (key: string) => typeof window === 'undefined' ? null : localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};
const api = createApiClient(`${API_URL}/api/v1`, storage, () => { window.location.href = '/auth/login'; });
export const getAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/') || url.startsWith('uploads/') || url.startsWith('/api/') || url.startsWith('api/')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${cleanUrl}`;
  }
  const cloudinaryBaseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || '';
  return `${cloudinaryBaseUrl}${url}`;
};

export default api;
