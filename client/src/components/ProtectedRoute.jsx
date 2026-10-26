import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route guard component for authenticated and role-restricted routes.
 *
 * @param {{ allowedRoles?: string[], children: React.ReactNode }} props
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loading indicator while session restoration is in progress
  if (!initialized) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading session...</span>
          </div>
          <p className="text-muted small">Verifying StaffSync authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page preserving attempted path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role authorization is required and user's role is not permitted
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned dashboard
    const roleDashboardMap = {
      hr: '/hr/dashboard',
      manager: '/manager/dashboard',
      employee: '/employee/dashboard'
    };
    const targetDashboard = roleDashboardMap[user.role] || '/employee/dashboard';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
