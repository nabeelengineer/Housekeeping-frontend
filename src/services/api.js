const apiRequest = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `/api/${cleanEndpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }

  return data;
};
