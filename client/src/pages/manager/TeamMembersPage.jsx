import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { FiUsers, FiClock, FiCalendar, FiMail, FiPhone } from 'react-icons/fi';

const TeamMembersPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await api.get('/manager/team');
      setTeam(res.data.team || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Assigned Team Members"
        subtitle="Manage employees, contact information, and attendance activity under your direct report"
      />

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          {error}
        </div>
      )}

      <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FiUsers className="text-primary" /> Direct Reports ({team.length})
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading team...</span>
            </div>
          </div>
        ) : team.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="No employees assigned yet"
            message="Your department has no direct reports assigned. HR Administrators can assign employees to your team."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Attendance Records</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <span className="badge bg-light text-dark border fw-bold">{emp.employeeId}</span>
                    </td>
                    <td className="fw-semibold text-dark">{emp.fullName}</td>
                    <td>
                      <a href={`mailto:${emp.email}`} className="text-decoration-none text-secondary small d-flex align-items-center gap-1">
                        <FiMail size={13} /> {emp.email}
                      </a>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>
                      {emp.phone ? (
                        <span className="small text-secondary d-flex align-items-center gap-1">
                          <FiPhone size={13} /> {emp.phone}
                        </span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border">
                        <FiClock className="me-1" /> {emp.totalAttendance} days
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={emp.isActive ? 'Active' : 'Inactive'} />
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

export default TeamMembersPage;
