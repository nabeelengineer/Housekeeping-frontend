import axios from 'axios';

// Determine the base URL based on environment
let baseURL;
if (import.meta.env.MODE === 'production') {
  // In production, use relative URL (handled by Nginx)
  baseURL = '/api';
} else {
  // In development, use the full URL to the backend
  baseURL = 'http://localhost:4000/api';
}

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

// Add request interceptor to log all requests
api.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log all responses
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

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
