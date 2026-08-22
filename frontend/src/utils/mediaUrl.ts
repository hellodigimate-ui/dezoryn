import { API_BASE_URL } from '../config/api.config';

/**
 * Resolves a media URL to an absolute URL.
 * Relative paths (like `/uploads/file.mp4`) are prepended with the backend base URL.
 */
export const BACKEND_URL = API_BASE_URL;

export function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  
  // If stored URL contains localhost or 127.0.0.1 and includes /uploads/, resolve dynamically to BACKEND_URL
  if (url.includes('/uploads/')) {
    const uploadsIndex = url.indexOf('/uploads/');
    const relativePath = url.substring(uploadsIndex);
    return `${BACKEND_URL}${relativePath}`;
  }

  return url;
}
