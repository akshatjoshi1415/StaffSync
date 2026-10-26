import axios from 'axios';

// Resolve base URL from Vite environment or default to local port 5001
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    '[StaffSync Config] VITE_API_BASE_URL is not set in client/.env. Defaulting to:',
    baseURL
  );
}

// Create central Axios instance with environment-based base URL
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT auth token if stored in localStorage (optional bearer support)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling centralized response/error logic
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handled by Redux / session handlers
    }
    return Promise.reject(error);
  }
);

export default api;
