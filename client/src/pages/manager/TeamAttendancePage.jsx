import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';

const TeamAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/manager/attendance');
      setAttendance(res.data.attendance || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAttendance();
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Team Attendance Tracking"
        subtitle="Review daily check-in / check-out times and punctuality for your direct reports"
      />

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          {error}
        </div>
      )}

      <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FiClock className="text-primary" /> Attendance Records
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading attendance...</span>
            </div>
          </div>
        ) : attendance.length === 0 ? (
          <EmptyState
            icon={FiClock}
            title="No attendance records recorded"
            message="Attendance check-ins submitted by your team members will appear here."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec) => (
                  <tr key={rec._id}>
                    <td className="fw-semibold text-dark">{rec.date}</td>
                    <td>
                      <div className="fw-bold text-dark">{rec.user?.fullName || 'Unknown'}</div>
                      <div className="text-muted small">{rec.employee?.employeeId}</div>
                    </td>
                    <td>{rec.employee?.department || 'General'}</td>
                    <td>{formatTime(rec.checkIn)}</td>
                    <td>{formatTime(rec.checkOut)}</td>
                    <td>
                      <StatusBadge status={rec.status} />
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

export default TeamAttendancePage;
