import api from './api';

/**
 * Authentication service handling API calls for authentication.
 * Uses HTTP-only cookies (withCredentials: true configured in api.js).
 */
const authService = {
  /**
   * Register a new employee account.
   * @param {{ fullName: string, email: string, password: string }} data
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Log in user with credentials.
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
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
   * Log out user and clear session cookie.
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default authService;
