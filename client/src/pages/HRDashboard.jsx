import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import {
  FiUsers,
  FiShield,
  FiClock,
  FiCalendar,
  FiBell,
  FiBarChart2,
  FiArrowRight,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiPlus
} from 'react-icons/fi';

const HRDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [reports, setReports] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reportsRes, leavesRes] = await Promise.all([
        api.get('/hr/reports'),
        api.get('/hr/leaves')
      ]);
      setReports(reportsRes.data.reports);
      setRecentLeaves(leavesRes.data.leaves?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to load HR dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDecision = async (leaveId, status) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.put(`/leaves/${leaveId}/status`, {
        status,
        reviewComment: `HR Administrator decision`
      });
      setMessage(`Leave request ${status.toLowerCase()} successfully.`);
      fetchDashboardData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`HR Administration — ${user?.fullName}`}
        subtitle="Organization-wide personnel governance, manager accounts, leave authorizations, and compliance reporting"
      />

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiCheckCircle /> <span>{message}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-blue">
                <FiUsers />
              </div>
              <div>
                <div className="text-muted small">Total Employees</div>
                <div className="fw-bold fs-4 text-dark">{reports?.totalEmployees || 0}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/hr/employees" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                Manage Directory <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-purple">
                <FiShield />
              </div>
              <div>
                <div className="text-muted small">Managers</div>
                <div className="fw-bold fs-4 text-dark">{reports?.totalManagers || 0}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/hr/managers" className="small text-purple text-decoration-none fw-medium d-flex align-items-center gap-1">
                Manage Accounts <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-teal">
                <FiClock />
              </div>
              <div>
                <div className="text-muted small">Present Today</div>
                <div className="fw-bold fs-4 text-success">{reports?.todayPresentCount || 0}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/hr/attendance" className="small text-teal text-decoration-none fw-medium d-flex align-items-center gap-1">
                Inspect Logs <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-orange">
                <FiCalendar />
              </div>
              <div>
                <div className="text-muted small">Pending Leaves</div>
                <div className="fw-bold fs-4 text-warning">{reports?.leaves?.pending || 0}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/hr/leaves" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                Review Requests <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Leaves Table & Module Grid */}
      <div className="row g-4">
        {/* Recent Leave Requests */}
        <div className="col-lg-7">
          <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Recent Leave Requests</h5>
              <Link to="/hr/leaves" className="small text-primary text-decoration-none fw-medium">
                View All Leaves
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
            ) : recentLeaves.length === 0 ? (
              <p className="text-muted small my-auto">No leave requests found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="table-light small text-secondary">
                    <tr>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Dates</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <div className="fw-semibold text-dark small">{l.user?.fullName}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{l.employee?.employeeId}</div>
                        </td>
                        <td className="small text-secondary">{l.leaveType}</td>
                        <td className="small">
                          {new Date(l.startDate).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="text-end">
                          {l.status === 'Pending' ? (
                            <div className="d-flex justify-content-end gap-1">
                              <button
                                onClick={() => handleDecision(l._id, 'Approved')}
                                disabled={actionLoading}
                                className="btn btn-sm btn-success px-2 py-0"
                                title="Approve"
                              >
                                <FiCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleDecision(l._id, 'Rejected')}
                                disabled={actionLoading}
                                className="btn btn-sm btn-outline-danger px-2 py-0"
                                title="Reject"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small fst-italic">Decided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* HR Quick Actions Grid */}
        <div className="col-lg-5">
          <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
            <h5 className="fw-bold text-dark mb-3">Administrative Operations</h5>
            <div className="d-flex flex-column gap-2">
              <Link to="/hr/employees" className="p-3 border rounded-3 text-decoration-none text-dark d-flex align-items-center justify-content-between feature-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-blue" style={{ width: '40px', height: '40px' }}>
                    <FiUsers />
                  </div>
                  <div>
                    <div className="fw-semibold small">Employee Directory</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Create, update, and assign staff members</div>
                  </div>
                </div>
                <FiArrowRight className="text-muted" />
              </Link>

              <Link to="/hr/managers" className="p-3 border rounded-3 text-decoration-none text-dark d-flex align-items-center justify-content-between feature-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-purple" style={{ width: '40px', height: '40px' }}>
                    <FiShield />
                  </div>
                  <div>
                    <div className="fw-semibold small">Manager Management</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Provision managers with supervisory roles</div>
                  </div>
                </div>
                <FiArrowRight className="text-muted" />
              </Link>

              <Link to="/hr/announcements" className="p-3 border rounded-3 text-decoration-none text-dark d-flex align-items-center justify-content-between feature-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-orange" style={{ width: '40px', height: '40px' }}>
                    <FiBell />
                  </div>
                  <div>
                    <div className="fw-semibold small">Publish Announcement</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Post company-wide notices and news</div>
                  </div>
                </div>
                <FiArrowRight className="text-muted" />
              </Link>

              <Link to="/hr/reports" className="p-3 border rounded-3 text-decoration-none text-dark d-flex align-items-center justify-content-between feature-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-teal" style={{ width: '40px', height: '40px' }}>
                    <FiBarChart2 />
                  </div>
                  <div>
                    <div className="fw-semibold small">View Reports & Stats</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Attendance and workforce summaries</div>
                  </div>
                </div>
                <FiArrowRight className="text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRDashboard;
