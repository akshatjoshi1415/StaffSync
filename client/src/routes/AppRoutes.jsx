import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Common Public Pages
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Employee Pages
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AttendancePage from '../pages/employee/AttendancePage';
import LeavePage from '../pages/employee/LeavePage';
import ProfilePage from '../pages/employee/ProfilePage';

// Manager Pages
import ManagerDashboard from '../pages/ManagerDashboard';
import TeamMembersPage from '../pages/manager/TeamMembersPage';
import TeamAttendancePage from '../pages/manager/TeamAttendancePage';
import LeaveApprovalsPage from '../pages/manager/LeaveApprovalsPage';

// HR Pages
import HRDashboard from '../pages/HRDashboard';
import EmployeeManagementPage from '../pages/hr/EmployeeManagementPage';
import ManagerManagementPage from '../pages/hr/ManagerManagementPage';
import AttendanceManagementPage from '../pages/hr/AttendanceManagementPage';
import LeaveManagementPage from '../pages/hr/LeaveManagementPage';
import ReportsPage from '../pages/hr/ReportsPage';

// Shared Pages
import AnnouncementsPage from '../pages/common/AnnouncementsPage';
import TrainingsPage from '../pages/common/TrainingsPage';

// Route Guards
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Home & Auth */}
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* ================= EMPLOYEE ROUTES ================= */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <LeavePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/announcements"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/trainings"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <TrainingsPage />
          </ProtectedRoute>
        }
      />

      {/* ================= MANAGER ROUTES ================= */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/team"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <TeamMembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/attendance"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <TeamAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/leaves"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <LeaveApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/trainings"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <TrainingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/announcements"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />

      {/* ================= HR ROUTES ================= */}
      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <EmployeeManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/managers"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <ManagerManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/attendance"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <AttendanceManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/leaves"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <LeaveManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/announcements"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/trainings"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <TrainingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/reports"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
