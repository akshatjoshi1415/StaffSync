import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import {
  FiClock,
  FiCalendar,
  FiBell,
  FiBookOpen,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leavesCount, setLeavesCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [trainingsCount, setTrainingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [todayRes, leavesRes, announcementsRes, trainingsRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/leaves/my'),
        api.get('/announcements'),
        api.get('/trainings')
      ]);
      setTodayAttendance(todayRes.data.attendance);
      setLeavesCount(leavesRes.data.leaves?.length || 0);
      setAnnouncements(announcementsRes.data.announcements?.slice(0, 3) || []);
      setTrainingsCount(trainingsRes.data.trainings?.length || 0);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/check-in');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/check-out');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.fullName}!`}
        subtitle="Employee Self-Service Portal — Manage daily attendance, leave applications, and view company updates."
      />

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        {/* Attendance Card */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-blue">
                <FiClock />
              </div>
              <div>
                <div className="text-muted small">Today's Attendance</div>
                <div className="fw-bold fs-5 text-dark">
                  {!todayAttendance ? (
                    <span className="text-secondary small">Not Checked In</span>
                  ) : !todayAttendance.checkOut ? (
                    <span className="text-success small">Checked In</span>
                  ) : (
                    <span className="text-primary small">Completed</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              {!todayAttendance ? (
                <button
                  onClick={handleQuickCheckIn}
                  disabled={actionLoading}
                  className="btn btn-sm btn-primary w-100 d-flex justify-content-center align-items-center gap-1"
                >
                  <FiLogIn /> Check In Now
                </button>
              ) : !todayAttendance.checkOut ? (
                <button
                  onClick={handleQuickCheckOut}
                  disabled={actionLoading}
                  className="btn btn-sm btn-warning text-dark w-100 d-flex justify-content-center align-items-center gap-1"
                >
                  <FiLogOut /> Check Out
                </button>
              ) : (
                <Link to="/employee/attendance" className="btn btn-sm btn-outline-secondary w-100">
                  View Timesheet
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Leaves Card */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-teal">
                <FiCalendar />
              </div>
              <div>
                <div className="text-muted small">My Leaves</div>
                <div className="fw-bold fs-4 text-dark">{leavesCount}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/employee/leaves" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                Apply or Track Status <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Announcements Card */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-purple">
                <FiBell />
              </div>
              <div>
                <div className="text-muted small">Announcements</div>
                <div className="fw-bold fs-4 text-dark">{announcements.length}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/employee/announcements" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                View Company Notices <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Trainings Card */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-box icon-box-orange">
                <FiBookOpen />
              </div>
              <div>
                <div className="text-muted small">Training Sessions</div>
                <div className="fw-bold fs-4 text-dark">{trainingsCount}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-top">
              <Link to="/employee/trainings" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                Browse Workshops <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules & Recent Announcements */}
      <div className="row g-4">
        {/* Module Nav Cards */}
        <div className="col-lg-6">
          <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
            <h5 className="fw-bold text-dark mb-3">Self-Service Actions</h5>
            <div className="row g-2">
              <div className="col-sm-6">
                <Link to="/employee/attendance" className="card p-3 border text-decoration-none text-dark feature-card h-100">
                  <div className="icon-box icon-box-blue mb-2">
                    <FiClock />
                  </div>
                  <div className="fw-semibold">Attendance Log</div>
                  <div className="text-muted small">Review monthly attendance and working hours.</div>
                </Link>
              </div>

              <div className="col-sm-6">
                <Link to="/employee/leaves" className="card p-3 border text-decoration-none text-dark feature-card h-100">
                  <div className="icon-box icon-box-teal mb-2">
                    <FiCalendar />
                  </div>
                  <div className="fw-semibold">Leave Applications</div>
                  <div className="text-muted small">Request time-off and track manager approvals.</div>
                </Link>
              </div>

              <div className="col-sm-6">
                <Link to="/employee/trainings" className="card p-3 border text-decoration-none text-dark feature-card h-100">
                  <div className="icon-box icon-box-orange mb-2">
                    <FiBookOpen />
                  </div>
                  <div className="fw-semibold">Skill Training</div>
                  <div className="text-muted small">Access scheduled courses and team workshops.</div>
                </Link>
              </div>

              <div className="col-sm-6">
                <Link to="/employee/profile" className="card p-3 border text-decoration-none text-dark feature-card h-100">
                  <div className="icon-box icon-box-purple mb-2">
                    <FiUser />
                  </div>
                  <div className="fw-semibold">Personal Profile</div>
                  <div className="text-muted small">Update phone number and view employment info.</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="col-lg-6">
          <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Recent Announcements</h5>
              <Link to="/employee/announcements" className="small text-primary text-decoration-none fw-medium">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-muted small my-auto">No announcements posted recently.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {announcements.map((item) => (
                  <div key={item._id} className="p-3 bg-light rounded-3 border">
                    <div className="fw-bold text-dark mb-1">{item.title}</div>
                    <div className="text-secondary small mb-2 text-truncate">{item.content}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {new Date(item.createdAt).toLocaleDateString()} &bull; Posted by {item.author?.fullName || 'HR'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
