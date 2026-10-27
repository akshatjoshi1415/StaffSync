import axios from 'axios';

/**
 * Resolves and normalizes the backend API base URL.
 * Ensures the /api endpoint prefix is present, prevents duplicate /api or trailing slashes,
 * and maintains development localhost fallback.
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    // Strip trailing slashes
    let normalized = envUrl.trim().replace(/\/+$/, '');

    // Automatically append /api if omitted
    if (!normalized.endsWith('/api')) {
      normalized = `${normalized}/api`;
    }
    return normalized;
  }

  // Development fallback vs production notification
  if (import.meta.env.PROD) {
    console.error(
      '[StaffSync Config] Missing VITE_API_BASE_URL in production environment variables! ' +
      'Requests will fail because localhost cannot be reached from production. ' +
      'Please add VITE_API_BASE_URL in your Vercel Project Settings -> Environment Variables and redeploy.'
    );
  } else {
    console.info('[StaffSync Config] Using local development API URL: http://localhost:5001/api');
  }

  return 'http://localhost:5001/api';
};

const baseURL = getBaseURL();

// Create central Axios instance with environment-based base URL
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT auth token if stored in localStorage (dual cookie + bearer token support)
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
      // Clear expired local token on 401 unauthorized
      localStorage.removeItem('staffsync_token');
    }
    return Promise.reject(error);
  }
);

export default api;
