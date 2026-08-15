import { API_BASE_URL } from '../config/api.config';

/**
 * Resolves a media URL to an absolute URL.
 * Relative paths (like `/uploads/file.mp4`) are prepended with the backend base URL.
 */
export const BACKEND_URL = API_BASE_URL;

export function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  return url;
}
