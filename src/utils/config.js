// This file automatically determines the correct API base URL
// based on the current environment

export const getApiBaseUrl = () => {
  // In development, use the Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }

  // In production, use the correct URL based on the current host
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const port = '4000'; // Your backend port
  
  // For localhost or 127.0.0.1, use localhost
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  // For production, use the current host
  return `${protocol}//${host}:${port}`;
};

// Export the base URL as a constant
export const API_BASE_URL = getApiBaseUrl();
