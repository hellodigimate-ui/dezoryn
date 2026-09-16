const DEFAULT_PRODUCTION_URL = 'https://dezoryn123.onrender.com';
const DEFAULT_LOCAL_URL = 'http://localhost:5000';

const isLocalhostHost = (): boolean => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return false;
};

const resolveUrl = (envVal: string | undefined): string => {
  let target = envVal?.trim();
  if (!target) {
    target = isLocalhostHost() ? DEFAULT_LOCAL_URL : DEFAULT_PRODUCTION_URL;
  }
  target = target.replace(/\/+$/, '');

  // Safety Guard: If running in a production browser environment, NEVER allow localhost URLs
  if (typeof window !== 'undefined' && !isLocalhostHost() && (target.includes('localhost') || target.includes('127.0.0.1'))) {
    return DEFAULT_PRODUCTION_URL;
  }

  return target;
};

const getInitialBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return resolveUrl(import.meta.env.VITE_API_URL);
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return resolveUrl(import.meta.env.VITE_API_BASE_URL);
  }
  if (isLocalhostHost()) {
    return DEFAULT_LOCAL_URL;
  }
  return DEFAULT_PRODUCTION_URL;
};

export const API_BASE_URL = getInitialBaseUrl();
export const API_PREFIX = '/api/v1';
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  apiUrl: API_URL,
  crmApiUrl: resolveUrl(import.meta.env.VITE_CRM_API_URL),
  estateApiUrl: resolveUrl(import.meta.env.VITE_ESTATE_API_URL),
  schoolycoreApiUrl: resolveUrl(import.meta.env.VITE_SCHOOLYCORE_API_URL || import.meta.env.VITE_ESTATE_API_URL),
  schoolycoreLiteApiUrl: resolveUrl(import.meta.env.VITE_SCHOOLYCORE_LITE_API_URL),
};

export function getFullApiUrl(endpoint: string): string {
  if (!endpoint) return API_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  if (endpoint.startsWith('/api/v1')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  if (endpoint.startsWith('/')) {
    return `${API_URL}${endpoint}`;
  }
  return `${API_URL}/${endpoint}`;
}

export async function apiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input.toString();
  const fullUrl = getFullApiUrl(urlStr);
  const token = localStorage.getItem('access_token');

  const headerObj: Record<string, string> = {};

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headerObj[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headerObj[key] = value;
      });
    } else {
      Object.assign(headerObj, init.headers);
    }
  }

  if (token && !headerObj['Authorization'] && !headerObj['authorization']) {
    headerObj['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    ...init,
    headers: headerObj,
    credentials: 'include',
  };

  const method = (init?.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    invalidateApiCache();
  }

  try {
    const res = await fetch(fullUrl, options);
    if (res.ok && method !== 'GET') {
      invalidateApiCache();
    }
    if (!res.ok) {
      if (res.status === 401) {
        console.warn(`[API] 401 Unauthorized: ${fullUrl}`);
      } else if (res.status === 403) {
        console.warn(`[API] 403 Forbidden: ${fullUrl}`);
      } else if (res.status === 404) {
        console.warn(`[API] 404 Not Found: ${fullUrl}`);
      } else if (res.status >= 500) {
        console.error(`[API] ${res.status} Internal Server Error: ${fullUrl}`);
      }
    }
    return res;
  } catch (error) {
    console.error(`[API] Network failure connecting to: ${fullUrl}`, error);
    throw error;
  }
}

const STORAGE_CACHE_PREFIX = 'dezo_api_cache_v2_';
const configCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<Response>>();

const CACHEABLE_ENDPOINTS = [
  '/site-settings',
  '/theme',
  '/contact',
  '/footer',
  '/nav',
  '/faqs',
  '/products',
  '/services',
  '/hero',
  '/homepage-stats',
  '/testimonials',
  '/demos',
  '/careers/cms',
  '/timeline',
  '/marketplace-hero'
];

function readFromStorage(key: string): { data: any; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}

function writeToStorage(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (_e) {
    // Graceful fallback if storage quota is exceeded
  }
}

export function invalidateApiCache(pattern?: string) {
  configCache.clear();
  inFlightRequests.clear();
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(STORAGE_CACHE_PREFIX)) {
          if (!pattern || k.includes(pattern)) {
            keysToRemove.push(k);
          }
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch (_e) {}
  }
}

export async function cachedApiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input.toString();
  const method = (init?.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  const isCacheable = CACHEABLE_ENDPOINTS.some((ep) => urlStr.includes(ep));

  if (isGet && isCacheable && !urlStr.includes('_t=')) {
    const key = getFullApiUrl(urlStr);

    // 1. In-flight request deduplication: reuse identical active request
    if (inFlightRequests.has(key)) {
      const inFlightRes = await inFlightRequests.get(key)!;
      return inFlightRes.clone();
    }

    // 2. Check memory cache (valid for 45 seconds)
    const memCached = configCache.get(key);
    if (memCached && Date.now() - memCached.timestamp < 45000) {
      return new Response(JSON.stringify(memCached.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Dezo-Cache': 'HIT-MEMORY'
        },
      });
    }

    // 3. Check persistent storage cache across page reloads (valid for 10 minutes)
    const storageCached = readFromStorage(key);
    if (storageCached && Date.now() - storageCached.timestamp < 600000) {
      // Re-populate memory cache
      configCache.set(key, storageCached);

      // If storage cache is older than 60 seconds, trigger background revalidation (Stale-While-Revalidate)
      if (Date.now() - storageCached.timestamp > 60000) {
        apiFetch(urlStr, init).then(async (freshRes) => {
          if (freshRes.ok) {
            try {
              const freshJson = await freshRes.json();
              configCache.set(key, { data: freshJson, timestamp: Date.now() });
              writeToStorage(key, freshJson);
            } catch (_err) {}
          }
        }).catch(() => {});
      }

      return new Response(JSON.stringify(storageCached.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Dezo-Cache': 'HIT-PERSISTENT'
        },
      });
    }

    // 4. Cache miss: fetch from network and store in memory + persistent storage
    const fetchPromise = apiFetch(urlStr, init).then(async (res) => {
      if (res.ok) {
        try {
          const json = await res.clone().json();
          const entry = { data: json, timestamp: Date.now() };
          configCache.set(key, entry);
          writeToStorage(key, json);
        } catch (_e) {}
      }
      return res;
    });

    inFlightRequests.set(key, fetchPromise);
    try {
      const res = await fetchPromise;
      return res.clone();
    } finally {
      inFlightRequests.delete(key);
    }
  }

  return apiFetch(input, init);
}
