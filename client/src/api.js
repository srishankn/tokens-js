let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => {
  return currentAccessToken;
};

const BASE_URL = 'http://localhost:8000';

export const signup = async (email, password) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Signup failed');

  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');

  setAccessToken(data.access_token);
  return data;
};

export const logout = async () => {
  try {
    await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      // credentials: 'include' ensures httpOnly cookies are sent
      credentials: 'include' 
    });
  } catch (err) {
    console.error('Logout error', err);
  } finally {
    setAccessToken(null);
  }
};

const refreshAccessToken = async () => {
  const response = await fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Refresh failed');

  setAccessToken(data.access_token);
  return data.access_token;
};

export const fetchProfile = async () => {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available. Please login.');
  }

  const makeProfileRequest = async (accessToken) => {
    return fetch(`${BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  };

  let response = await makeProfileRequest(token);
  let data = await response.json();

  if (response.status === 401 && data.error === 'TOKEN_EXPIRED') {
    console.log('Access token expired. Attempting refresh.');
    try {
      token = await refreshAccessToken();
      // Retry profile request with new token
      response = await makeProfileRequest(token);
      data = await response.json();
    } catch (refreshError) {
      console.error('Refresh failed:', refreshError.message);
      // If refresh fails (or returns INVALID_TOKEN), it should trigger logout/redirect
      throw new Error('REFRESH_FAILED');
    }
  }

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch profile');
  }

  return data;
};


const authenticatedFetch = async (endpoint, options = {}) => {
  let token = getAccessToken();
  if (!token) throw new Error('No access token available. Please login.');

  const makeRequest = async (accessToken) => {
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  };

  let response = await makeRequest(token);
  let data = await response.json().catch(() => null);

  if (response.status === 401 && data?.error === 'TOKEN_EXPIRED') {
    console.log(`Access token expired for Todo API ${endpoint}. Attempting refresh...`);
    try {
      token = await refreshAccessToken();
      response = await makeRequest(token);
      data = await response.json().catch(() => null);
    } catch (err) {
      throw new Error('REFRESH_FAILED');
    }
  }

  if (!response.ok) {
    throw new Error((data && data.error) || 'API request failed');
  }

  return data;
};

export const fetchTodos = () => authenticatedFetch('/todos');

export const createTodo = (title) => authenticatedFetch('/todos', {
  method: 'POST',
  body: JSON.stringify({ title })
});

export const updateTodo = (id, updates) => authenticatedFetch(`/todos/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updates)
});

export const deleteTodo = (id) => authenticatedFetch(`/todos/${id}`, {
  method: 'DELETE'
});
