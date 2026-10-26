import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { loginUser, clearError } from '../store/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Clear previous auth errors when page loads
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate on successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const fromPath = location.state?.from?.pathname;
      if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
        navigate(fromPath, { replace: true });
      } else {
        const roleDashboardMap = {
          hr: '/hr/dashboard',
          manager: '/manager/dashboard',
          employee: '/employee/dashboard'
        };
        navigate(roleDashboardMap[user.role] || '/employee/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (validationError) setValidationError('');
    if (error) dispatch(clearError());
  };

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    if (validationError) setValidationError('');
    if (error) dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    dispatch(loginUser(formData));
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your StaffSync portal account"
    >
      {/* Error alert */}
      {(validationError || error) && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small" role="alert">
          <FiAlertCircle className="flex-shrink-0" />
          <div>{validationError || error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary" htmlFor="login-email">
            Work Email Address
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <FiMail />
            </span>
            <input
              type="email"
              id="login-email"
              name="email"
              className="form-control border-start-0"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password input with show/hide */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label small fw-semibold text-secondary" htmlFor="login-password">
              Password
            </label>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <FiLock />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              name="password"
              className="form-control border-start-0 border-end-0"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-outline-secondary border-start-0 bg-light text-muted"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-100 py-2 fw-medium shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Authenticating...
            </>
          ) : (
            <>
              <FiLogIn /> Sign In
            </>
          )}
        </button>

        {/* Link to Registration */}
        <div className="text-center small text-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-primary text-decoration-none fw-semibold">
            Register as Employee
          </Link>
        </div>

        {/* Demo Credentials Quick-Fill */}
        <div className="mt-4 pt-3 border-top">
          <div className="small fw-semibold text-secondary mb-2 text-center">
            Demo Credentials (1-Click Fill):
          </div>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              onClick={() => fillDemo('admin@staffsync.com', 'Admin123!')}
            >
              HR Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success px-2 py-1"
              onClick={() => fillDemo('manager@staffsync.com', 'Manager123!')}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary px-2 py-1"
              onClick={() => fillDemo('employee@staffsync.com', 'Employee123!')}
            >
              Employee
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
