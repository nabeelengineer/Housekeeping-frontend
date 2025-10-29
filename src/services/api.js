// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  // In production, always use relative URLs that will be handled by nginx
  // In development, use the full URL with localhost
  const isProduction = import.meta.env.PROD;
  
  // Remove any leading slashes to prevent double slashes
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  
  // Construct the URL
  let url;
  if (isProduction) {
    // In production, use relative URLs with /api prefix
    url = `/api/${cleanEndpoint}`;
  } else {
    // In development, use the full URL with localhost
    url = `http://localhost:4000/${cleanEndpoint}`;
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
