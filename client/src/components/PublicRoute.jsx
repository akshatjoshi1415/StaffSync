import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Route guard component for public-only auth routes (e.g. /login, /register).
 * Redirects already-authenticated users to their respective role dashboards.
 */
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const roleDashboardMap = {
      hr: '/hr/dashboard',
      manager: '/manager/dashboard',
      employee: '/employee/dashboard'
    };
    return <Navigate to={roleDashboardMap[user.role] || '/employee/dashboard'} replace />;
  }

  return children;
};

export default PublicRoute;
