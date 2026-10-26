import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiBookOpen,
  FiCheck,
  FiX,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [team, setTeam] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [teamRes, leavesRes, attendanceRes, trainingsRes] = await Promise.all([
        api.get('/manager/team'),
        api.get('/manager/leaves'),
        api.get('/manager/attendance'),
        api.get('/trainings')
      ]);
      setTeam(teamRes.data.team || []);
      setLeaves(leavesRes.data.leaves || []);
      setAttendance(attendanceRes.data.attendance || []);
      setTrainings(trainingsRes.data.trainings || []);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickDecision = async (leaveId, status) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.put(`/leaves/${leaveId}/status`, {
        status,
        reviewComment: `Decision from Manager Dashboard`
      });
      setMessage(`Leave ${status.toLowerCase()} successfully.`);
      fetchDashboardData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  return (
    <DashboardLayout>
      <PageHeader
        title={`Manager Portal — ${user?.fullName}`}
        subtitle="Department workforce oversight, leave approvals, team attendance, and training coordination"
      />

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiCheckCircle /> <span>{message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-teal">
                <FiUsers />
              </div>
              <div>
                <div className="text-muted small">Direct Reports</div>
                <div className="fw-bold fs-4 text-dark">{team.length}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/manager/team" className="small text-teal text-decoration-none fw-medium d-flex align-items-center gap-1">
                View Team Members <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-purple">
                <FiCalendar />
              </div>
              <div>
                <div className="text-muted small">Pending Leaves</div>
                <div className="fw-bold fs-4 text-warning">{pendingLeaves.length}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/manager/leaves" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                Review Applications <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-blue">
                <FiClock />
              </div>
              <div>
                <div className="text-muted small">Attendance Logs</div>
                <div className="fw-bold fs-4 text-dark">{attendance.length}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/manager/attendance" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                View Shifts & Hours <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-orange">
                <FiBookOpen />
              </div>
              <div>
                <div className="text-muted small">Team Trainings</div>
                <div className="fw-bold fs-4 text-dark">{trainings.length}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/manager/trainings" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                Manage Courses <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Pending Approvals & Module Navigation */}
      <div className="row g-4">
        {/* Pending Approvals Widget */}
        <div className="col-lg-7">
          <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Pending Leave Approvals</h5>
              <Link to="/manager/leaves" className="small text-primary text-decoration-none fw-medium">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                <FiCheckCircle size={32} className="text-success mb-2 d-block mx-auto" />
                All team leave requests are currently up to date!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="table-light small text-secondary">
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th className="text-end">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.slice(0, 5).map((l) => (
                      <tr key={l._id}>
                        <td>
                          <div className="fw-semibold text-dark small">{l.user?.fullName}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{l.employee?.employeeId}</div>
                        </td>
                        <td className="small text-secondary">{l.leaveType}</td>
                        <td className="small">
                          {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleQuickDecision(l._id, 'Approved')}
                            disabled={actionLoading}
                            className="btn btn-sm btn-success me-1 px-2 py-0"
                            title="Approve"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleQuickDecision(l._id, 'Rejected')}
                            disabled={actionLoading}
                            className="btn btn-sm btn-outline-danger px-2 py-0"
                            title="Reject"
                          >
                            <FiX size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Manager Actions Cards */}
        <div className="col-lg-5">
          <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
            <h5 className="fw-bold text-dark mb-3">Management Modules</h5>
            <div className="d-flex flex-column gap-2">
              <Link to="/manager/team" className="p-3 border rounded-3 text-decoration-none text-dark d-flex align-items-center justify-content-between feature-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-teal" style={{ width: '40px', height: '40px' }}>
                    <FiUsers />
                  </div>
                  <div>
                    <div className="fw-semibold small">Team Roster</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Direct reports, designations, contact info</div>
                  </div>
                </div>
                <FiArrowRight className="text-muted" />
              </Link>

              <Link to="/manager/attendance" className="p-3 border rounded-3 text-decoration-none text-dark d-flex align-items-center justify-content-between feature-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-blue" style={{ width: '40px', height: '40px' }}>
                    <FiClock />
                  </div>
                  <div>
                    <div className="fw-semibold small">Team Attendance</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Daily check-in / check-out times</div>
                  </div>
                </div>
                <FiArrowRight className="text-muted" />
              </Link>

              <Link to="/manager/trainings" className="p-3 border rounded-3 text-decoration-none text-dark d-flex align-items-center justify-content-between feature-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-orange" style={{ width: '40px', height: '40px' }}>
                    <FiBookOpen />
                  </div>
                  <div>
                    <div className="fw-semibold small">Schedule Training</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Organize workshops and team sessions</div>
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

export default ManagerDashboard;
