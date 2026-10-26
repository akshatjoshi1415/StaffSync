import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import {
  FiClock,
  FiLogIn,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar
} from 'react-icons/fi';

const AttendancePage = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my')
      ]);
      setTodayAttendance(todayRes.data.attendance);
      setHistory(historyRes.data.history || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.post('/attendance/check-in');
      setMessage(res.data.message || 'Check-in recorded successfully.');
      fetchAttendanceData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.post('/attendance/check-out');
      setMessage(res.data.message || 'Check-out recorded successfully.');
      fetchAttendanceData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Attendance & Work Hours"
        subtitle="Record daily check-in / check-out times and inspect attendance history"
      />

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiCheckCircle /> <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiAlertCircle /> <span>{error}</span>
        </div>
      )}

      {/* Today's Attendance Action Card */}
      <div className="card border-0 bg-white shadow-sm p-4 mb-4 rounded-3">
        <div className="row align-items-center g-3">
          <div className="col-md-7">
            <span className="badge bg-light text-primary border mb-2 px-2 py-1">
              <FiCalendar className="me-1" /> Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <h4 className="fw-bold text-dark mb-1">
              {!todayAttendance
                ? 'Ready to Start Your Workday?'
                : !todayAttendance.checkOut
                ? 'Workday In Progress'
                : 'Workday Completed'}
            </h4>
            <p className="text-muted small mb-0">
              {!todayAttendance
                ? 'Click "Mark Check-In" to log your attendance for today.'
                : !todayAttendance.checkOut
                ? `You checked in at ${formatTime(todayAttendance.checkIn)}. Click "Mark Check-Out" when your shift finishes.`
                : `You clocked in at ${formatTime(todayAttendance.checkIn)} and clocked out at ${formatTime(todayAttendance.checkOut)}.`}
            </p>
          </div>

          <div className="col-md-5 text-md-end">
            {!todayAttendance ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="btn btn-primary btn-lg px-4 shadow-sm fw-medium d-inline-flex align-items-center gap-2"
              >
                <FiLogIn /> {actionLoading ? 'Recording...' : 'Mark Check-In'}
              </button>
            ) : !todayAttendance.checkOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="btn btn-warning btn-lg px-4 shadow-sm fw-medium d-inline-flex align-items-center gap-2 text-dark"
              >
                <FiLogOut /> {actionLoading ? 'Recording...' : 'Mark Check-Out'}
              </button>
            ) : (
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-success-subtle text-success border border-success-subtle rounded-3 fw-semibold">
                <FiCheckCircle /> Daily Attendance Recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FiClock className="text-primary" /> Personal Attendance History
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading records...</span>
            </div>
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={FiClock}
            title="No attendance records found"
            message="Check in daily to build your attendance log and work hour history."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record._id}>
                    <td className="fw-semibold text-dark">{record.date}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
