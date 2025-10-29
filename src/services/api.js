// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  // Use Vite's environment variable for the base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  // Construct the full URL
  let url;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (import.meta.env.PROD) {
    // In production, use relative URLs with /api prefix
    const basePath = endpoint.startsWith('/api') ? '' : '/api';
    url = `${basePath}${endpoint}`;
  } else {
    // In development, use the full URL from VITE_API_BASE_URL
    url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include', // Important for cookies/sessions
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Auth API
export const authApi = {
  login: (credentials) => 
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData) => 
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  // Add other auth methods as needed
};

// Example for other API services
export const userApi = {
  getProfile: () => apiRequest('/api/users/me'),
  // Add other user methods
};

// Export the base API function for custom requests
export default apiRequest;
