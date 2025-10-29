import axios from 'axios';

// Log environment and API URL for debugging
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// In production, use relative URLs without /api prefix (handled by Nginx proxy)
// In development, use the full URL with /api prefix
const isProduction = import.meta.env.PROD;

const api = axios.create({
  baseURL: isProduction ? '' : 'http://localhost:4000',
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: 'Request timed out. Please try again.'
});

console.log('Final API baseURL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('employee_id');
    }
    return Promise.reject(err);
  }
);

export default api;
