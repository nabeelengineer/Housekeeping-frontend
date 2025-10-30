import axios from 'axios';

// In production, we'll use relative URLs that will be handled by Nginx
// In development, we'll use the full URL to the backend
const baseURL = import.meta.env.DEV 
  ? 'http://localhost:4000/api' 
  : '/api';

// Log environment and API URL for debugging
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Using baseURL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: 'Request timed out. Please try again.',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
