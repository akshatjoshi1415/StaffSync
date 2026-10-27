import api from './api';

/**
 * Authentication service handling API calls for authentication.
 * Supports dual-mode authentication:
 * 1. HTTP-only cookies (withCredentials: true configured in api.js)
 * 2. Authorization Bearer header (via localStorage token backup for cross-origin third-party cookie restrictions)
 */
const authService = {
  /**
   * Register a new employee account.
   * @param {{ fullName: string, email: string, password: string }} data
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data && response.data.token) {
      localStorage.setItem('staffsync_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Log in user with credentials.
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('staffsync_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Get currently authenticated user profile.
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out user and clear session cookie and local token.
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      localStorage.removeItem('staffsync_token');
    }
  }
};

export default authService;
