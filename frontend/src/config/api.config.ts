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

const configCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<Response>>();

export function invalidateApiCache(pattern?: string) {
  if (!pattern) {
    configCache.clear();
    inFlightRequests.clear();
    return;
  }
  for (const key of configCache.keys()) {
    if (key.includes(pattern)) configCache.delete(key);
  }
  for (const key of inFlightRequests.keys()) {
    if (key.includes(pattern)) inFlightRequests.delete(key);
  }
}

export async function cachedApiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input.toString();
  const method = (init?.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  const configEndpoints = ['/site-settings', '/theme', '/contact', '/footer', '/nav', '/faqs'];
  const isConfigRoute = configEndpoints.some((ep) => urlStr.includes(ep));

  if (isGet && isConfigRoute) {
    const key = getFullApiUrl(urlStr);

    if (inFlightRequests.has(key)) {
      const inFlightRes = await inFlightRequests.get(key)!;
      return inFlightRes.clone();
    }

    const cached = configCache.get(key);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fetchPromise = apiFetch(urlStr, init).then(async (res) => {
      if (res.ok) {
        try {
          const json = await res.clone().json();
          configCache.set(key, { data: json, timestamp: Date.now() });
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
