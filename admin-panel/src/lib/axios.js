import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000, // 15s timeout to prevent requests from hanging indefinitely
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isPublicEndpoint = (url = '') => {
  const cleanUrl = url.split('?')[0];
  return (
    cleanUrl.endsWith('/categories') ||
    cleanUrl.endsWith('/products') ||
    cleanUrl.includes('/products/') ||
    cleanUrl.endsWith('/banners/active') ||
    cleanUrl.endsWith('/apparel-templates')
  );
};

api.interceptors.request.use(
  (config) => {
    // Normalize URL if baseURL ends with '/api' or is '/api' and config.url starts with '/api/'
    if (config.url && config.url.startsWith('/api/') && (config.baseURL?.endsWith('/api') || config.baseURL === '/api')) {
      config.url = config.url.substring(4);
    }

    // Always sync Bearer token dynamically from localStorage if present
    const token = localStorage.getItem('admin_accessToken') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[AXIOS REQ] ${config.method?.toUpperCase()} ${config.url} | AuthHeader: ${config.headers.Authorization ? 'Bearer ***' : 'NONE'}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS RES] ${response.config.method?.toUpperCase()} ${response.config.url} | Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const status = error.response?.status;

    console.warn(`[AXIOS ERR] ${originalRequest?.method?.toUpperCase()} ${requestUrl} | Status: ${status || 'NET_ERR/TIMEOUT'} | isRefreshing: ${isRefreshing}`);

    // Return error immediately if no response, status is not 401, or endpoint is public
    if (!error.response || status !== 401 || isPublicEndpoint(requestUrl)) {
      if (isPublicEndpoint(requestUrl)) {
        console.log(`[AXIOS BYPASS] Public endpoint ${requestUrl} bypassing auth refresh queue`);
      }
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify-email');

    // Never retry, queue, or block requests when auth endpoints fail with 401 or if request was already retried
    if (isAuthEndpoint || originalRequest?._retry) {
      if (requestUrl.includes('/auth/refresh') || requestUrl.includes('/auth/login')) {
        localStorage.removeItem('admin_accessToken');
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
      }
      isRefreshing = false;
      processQueue(error, null);
      return Promise.reject(error);
    }

    // If another request is currently refreshing the token, queue this request
    if (isRefreshing) {
      console.log(`[AXIOS QUEUE] Queuing request ${requestUrl} while token refreshes`);
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
          return Promise.reject(error);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;
    console.log(`[AXIOS REFRESH] Initiating token refresh for ${requestUrl}`);

    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const refreshRes = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      const newToken = refreshRes.data?.data?.accessToken;

      if (newToken) {
        console.log(`[AXIOS REFRESH SUCCESS] New token received, retrying ${requestUrl}`);
        localStorage.setItem('admin_accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } else {
        processQueue(error, null);
        return Promise.reject(error);
      }
    } catch (refreshError) {
      console.error(`[AXIOS REFRESH FAILED] Refresh failed: ${refreshError.message}`);
      localStorage.removeItem('admin_accessToken');
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
