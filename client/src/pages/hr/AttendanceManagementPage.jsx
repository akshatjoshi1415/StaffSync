import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { FiClock, FiCalendar, FiFilter, FiRefreshCw } from 'react-icons/fi';

const AttendanceManagementPage = () => {
  const [attendance, setAttendance] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = async (dateParam = '') => {
    setLoading(true);
    try {
      const url = dateParam ? `/hr/attendance?date=${dateParam}` : '/hr/attendance';
      const res = await api.get(url);
      setAttendance(res.data.attendance || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organization attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchAttendance(filterDate);
  };

  const handleReset = () => {
    setFilterDate('');
    fetchAttendance('');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Organization Attendance Logs"
        subtitle="Review company-wide check-in times, check-out times, and daily attendance logs"
      />

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          {error}
        </div>
      )}

      <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
        {/* Date Filter Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <FiClock className="text-primary" /> Attendance History ({attendance.length})
          </h5>

          <form onSubmit={handleFilter} className="d-flex align-items-center gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
              <FiFilter size={13} /> Filter
            </button>
            {filterDate && (
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              >
                <FiRefreshCw size={13} /> Reset
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading records...</span>
            </div>
          </div>
        ) : attendance.length === 0 ? (
          <EmptyState
            icon={FiClock}
            title="No attendance records found"
            message={
              filterDate
                ? `No attendance check-ins recorded for date ${filterDate}.`
                : 'Attendance logs will appear here once employees begin checking in.'
            }
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
                      <div className="text-muted small">{rec.employee?.employeeId} &bull; {rec.user?.email}</div>
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

export default AttendanceManagementPage;
