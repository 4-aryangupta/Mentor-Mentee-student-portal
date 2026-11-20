import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let accessToken = null;
let refreshPromise = null;
export const setAccessToken = (token) => { accessToken = token; };

const api = axios.create({ baseURL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config || {};
  const url = original.url || '';
  if (error.response?.status !== 401 || original._retry || url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
    return Promise.reject(error);
  }
  original._retry = true;
  try {
    if (!refreshPromise) refreshPromise = axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true }).finally(() => { refreshPromise = null; });
    const response = await refreshPromise;
    accessToken = response.data.data.accessToken;
    original.headers = original.headers || {};
    original.headers.Authorization = `Bearer ${accessToken}`;
    return api(original);
  } catch (refreshError) {
    accessToken = null;
    window.dispatchEvent(new CustomEvent('portal:session-expired'));
    return Promise.reject(refreshError);
  }
});

export const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
export default api;
