import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { registerUser, clearError } from '../store/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate on successful registration
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (validationError) setValidationError('');
    if (error) dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setValidationError('Full name must be at least 2 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    dispatch(
      registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password
      })
    );
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register as an employee on StaffSync"
    >
      {/* Notice that public registration is for employee accounts */}
      <div className="alert alert-primary py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
        <FiCheckCircle className="flex-shrink-0" />
        <div>
          Standard registration provisions a secure <strong>Employee</strong> portal account.
        </div>
      </div>

      {/* Error alert */}
      {(validationError || error) && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3" role="alert">
          <FiAlertCircle className="flex-shrink-0" />
          <div>{validationError || error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary" htmlFor="reg-name">
            Full Name
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <FiUser />
            </span>
            <input
              type="text"
              id="reg-name"
              name="fullName"
              className="form-control border-start-0"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary" htmlFor="reg-email">
            Work Email Address
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <FiMail />
            </span>
            <input
              type="email"
              id="reg-email"
              name="email"
              className="form-control border-start-0"
              placeholder="jane.doe@company.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary" htmlFor="reg-password">
            Password (min. 8 characters)
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <FiLock />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="reg-password"
              name="password"
              className="form-control border-start-0 border-end-0"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="form-label small fw-semibold text-secondary" htmlFor="reg-confirm">
            Confirm Password
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <FiLock />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="reg-confirm"
              name="confirmPassword"
              className="form-control border-start-0"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-100 py-2 fw-medium shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Registering Account...
            </>
          ) : (
            <>
              <FiUserPlus /> Register Account
            </>
          )}
        </button>

        {/* Link to Login */}
        <div className="text-center small text-muted">
          Already registered?{' '}
          <Link to="/login" className="text-primary text-decoration-none fw-semibold">
            Sign In here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
