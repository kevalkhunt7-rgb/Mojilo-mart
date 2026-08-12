import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 25000, // 15s timeout to prevent requests from hanging indefinitely
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
    // 1. Attach Auth Token if logged in
    const token = localStorage.getItem('mojilo_accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach Guest Session ID if it exists
    const sessionId = localStorage.getItem('mojilo_sessionId');
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }

    console.log(`[FRONTEND AXIOS REQ] ${config.method?.toUpperCase()} ${config.url} | AuthHeader: ${config.headers.Authorization ? 'Bearer ***' : 'NONE'}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`[FRONTEND AXIOS RES] ${response.config.method?.toUpperCase()} ${response.config.url} | Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const status = error.response?.status;

    console.warn(`[FRONTEND AXIOS ERR] ${originalRequest?.method?.toUpperCase()} ${requestUrl} | Status: ${status || 'NET_ERR/TIMEOUT'} | isRefreshing: ${isRefreshing}`);

    // Return error immediately if no response, status is not 401, or endpoint is public
    if (!error.response || status !== 401 || isPublicEndpoint(requestUrl)) {
      if (isPublicEndpoint(requestUrl)) {
        console.log(`[FRONTEND AXIOS BYPASS] Public endpoint ${requestUrl} bypassing auth refresh queue`);
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
        localStorage.removeItem('mojilo_accessToken');
        delete api.defaults.headers.common['Authorization'];
      }
      isRefreshing = false;
      processQueue(error, null);
      return Promise.reject(error);
    }

    // If another request is currently refreshing the token, queue this request
    if (isRefreshing) {
      console.log(`[FRONTEND AXIOS QUEUE] Queuing request ${requestUrl} while token refreshes`);
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
    console.log(`[FRONTEND AXIOS REFRESH] Initiating token refresh for ${requestUrl}`);

    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const refreshRes = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      const newToken = refreshRes.data?.data?.accessToken;

      if (newToken) {
        console.log(`[FRONTEND AXIOS REFRESH SUCCESS] New token received, retrying ${requestUrl}`);
        localStorage.setItem('mojilo_accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } else {
        processQueue(error, null);
        return Promise.reject(error);
      }
    } catch (refreshError) {
      console.error(`[FRONTEND AXIOS REFRESH FAILED] Refresh failed: ${refreshError.message}`);
      localStorage.removeItem('mojilo_accessToken');
      delete api.defaults.headers.common['Authorization'];
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
