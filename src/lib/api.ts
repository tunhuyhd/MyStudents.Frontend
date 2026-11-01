import { createApiClient } from './createApiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7287';
const api = createApiClient('/api/bff', () => { window.location.href = '/auth/login'; });
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
