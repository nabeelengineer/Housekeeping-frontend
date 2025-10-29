import axios from 'axios';

// Log environment and API URL for debugging
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Use VITE_API_BASE_URL if provided, otherwise use relative path in production
const baseURL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:4000' : '');

const api = axios.create({
  baseURL: `${baseURL}${baseURL ? '' : '/'}api`,
  withCredentials: true,
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
