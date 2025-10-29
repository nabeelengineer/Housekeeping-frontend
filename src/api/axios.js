import axios from 'axios';

// Use relative path in production, localhost in development
const baseURL = import.meta.env.DEV
  ? 'http://localhost:4000'
  : '';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});

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
