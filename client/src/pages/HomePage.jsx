import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logoutUser } from '../store/authSlice';
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiShield,
  FiCheckCircle,
  FiAward,
  FiBriefcase,
  FiLogIn,
  FiUserPlus,
  FiArrowRight,
  FiLogOut,
  FiBell,
  FiBookOpen,
  FiLayers
} from 'react-icons/fi';

const HomePage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'hr') return '/hr/dashboard';
    if (user.role === 'manager') return '/manager/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light-subtle">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-custom py-3 bg-white border-bottom sticky-top shadow-sm">
        <div className="container">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="icon-box icon-box-blue" style={{ width: '38px', height: '38px' }}>
              <FiUsers size={20} />
            </div>
            <span className="fs-4 fw-bold text-dark tracking-tight">
              Staff<span className="text-primary">Sync</span>
            </span>
            <span className="brand-badge ms-2">v1.0.0</span>
          </Link>

          <div className="d-flex align-items-center gap-3">
            <a href="#features" className="nav-link text-secondary d-none d-md-inline-block small fw-medium">
              Features
            </a>
            <a href="#portals" className="nav-link text-secondary d-none d-md-inline-block small fw-medium">
              Portals
            </a>
            <a href="#demo-access" className="nav-link text-secondary d-none d-md-inline-block small fw-medium">
              Demo Access
            </a>

            {isAuthenticated && user ? (
              <div className="d-flex align-items-center gap-2">
                <Link to={getDashboardPath()} className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
                  Dashboard <FiArrowRight />
                </Link>
                <button
                  onClick={() => dispatch(logoutUser())}
                  className="btn btn-outline-secondary btn-sm"
                  title="Logout"
                >
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                  <FiLogIn /> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
                  <FiUserPlus /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section text-center py-5 bg-white border-bottom">
        <div className="container py-4">
          <div className="mb-3">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold shadow-sm">
              <FiShield className="me-1" /> Modern Human Resource Management System
            </span>
          </div>
          <h1 className="hero-title display-4 fw-bold text-dark mb-3">
            Empower Your Workforce with <span className="text-primary">StaffSync</span>
          </h1>
          <p className="hero-subtitle text-secondary mb-4 mx-auto" style={{ maxWidth: '720px', fontSize: '1.15rem' }}>
            A unified, role-based platform designed to streamline employee self-service, manager oversight,
            attendance tracking, leave approvals, and organization-wide HR governance.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {isAuthenticated && user ? (
              <Link
                to={getDashboardPath()}
                className="btn btn-primary btn-lg px-4 shadow-sm fw-medium d-inline-flex align-items-center gap-2"
              >
                Go to {user.role.toUpperCase()} Dashboard <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-primary btn-lg px-4 shadow-sm fw-medium d-inline-flex align-items-center gap-2"
                >
                  <FiLogIn /> Sign In to Portal
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-primary btn-lg px-4 fw-medium d-inline-flex align-items-center gap-2"
                >
                  <FiUserPlus /> Employee Registration
                </Link>
              </>
            )}
            <a
              href="#features"
              className="btn btn-outline-secondary btn-lg px-4 fw-medium d-inline-flex align-items-center gap-2"
            >
              <FiLayers /> Explore Features
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container my-5 flex-grow-1">
        {/* Key Features Grid */}
        <section id="features" className="mb-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Designed for Every Organizational Need</h2>
            <p className="text-muted">
              Built with robust security, role-based controls, and seamless workflows.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-blue mb-3">
                  <FiShield />
                </div>
                <h5 className="fw-bold text-dark">Role-Based Access Control</h5>
                <p className="text-muted small mb-0">
                  Granular security distinguishing HR administrators, supervisors/managers, and employees with strict backend authorization.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-teal mb-3">
                  <FiClock />
                </div>
                <h5 className="fw-bold text-dark">Smart Attendance Tracking</h5>
                <p className="text-muted small mb-0">
                  Daily check-in and check-out logs with automated work-duration calculation and punctuality auditing across departments.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-orange mb-3">
                  <FiCalendar />
                </div>
                <h5 className="fw-bold text-dark">Streamlined Leave Approvals</h5>
                <p className="text-muted small mb-0">
                  Employees submit leave applications with reason and dates; managers and HR evaluate, approve, or reject in real time.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-purple mb-3">
                  <FiBell />
                </div>
                <h5 className="fw-bold text-dark">Company Announcements</h5>
                <p className="text-muted small mb-0">
                  Broadcast company news, policy updates, and critical notices instantaneously to all staff members from the HR console.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-blue mb-3">
                  <FiBookOpen />
                </div>
                <h5 className="fw-bold text-dark">Training & Development</h5>
                <p className="text-muted small mb-0">
                  Schedule skill-building workshops, team seminars, and training sessions with clear agendas and schedules.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-teal mb-3">
                  <FiAward />
                </div>
                <h5 className="fw-bold text-dark">Workforce Analytics</h5>
                <p className="text-muted small mb-0">
                  Real-time headcount reporting, present-today summaries, leave balance statistics, and directory governance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portals Overview */}
        <section id="portals" className="mb-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-dark">Role-Specific Workspaces</h3>
            <p className="text-muted">
              Dedicated, tailored dashboards empowering every team member at every level.
            </p>
          </div>

          <div className="row g-4">
            {/* Employee Portal */}
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-blue mb-3">
                  <FiUsers />
                </div>
                <h5 className="fw-bold text-dark">Employee Self-Service</h5>
                <p className="text-muted small mb-3">
                  Empowers employees with digital access to manage their day-to-day work records.
                </p>
                <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-2">
                  <li><FiCheckCircle className="text-primary me-2" /> Secure login & profile management</li>
                  <li><FiCheckCircle className="text-primary me-2" /> Daily attendance clock-in / clock-out</li>
                  <li><FiCheckCircle className="text-primary me-2" /> Leave applications & status tracking</li>
                  <li><FiCheckCircle className="text-primary me-2" /> Announcements & training catalog</li>
                </ul>
              </div>
            </div>

            {/* Manager Portal */}
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-teal mb-3">
                  <FiBriefcase />
                </div>
                <h5 className="fw-bold text-dark">Manager Portal</h5>
                <p className="text-muted small mb-3">
                  Equips team leads and managers with approval tools and workforce insights.
                </p>
                <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-2">
                  <li><FiCheckCircle className="text-success me-2" /> Direct reports roster & contacts</li>
                  <li><FiCheckCircle className="text-success me-2" /> Leave approvals and rejections</li>
                  <li><FiCheckCircle className="text-success me-2" /> Department attendance tracking</li>
                  <li><FiCheckCircle className="text-success me-2" /> Training coordination & scheduling</li>
                </ul>
              </div>
            </div>

            {/* HR Administration */}
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 border bg-white shadow-sm">
                <div className="icon-box icon-box-purple mb-3">
                  <FiAward />
                </div>
                <h5 className="fw-bold text-dark">HR Administration</h5>
                <p className="text-muted small mb-3">
                  Organization-wide management, compliance, reporting, and operational governance.
                </p>
                <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-2">
                  <li><FiCheckCircle className="text-purple me-2" /> Complete employee directory</li>
                  <li><FiCheckCircle className="text-purple me-2" /> Manager account provisioning</li>
                  <li><FiCheckCircle className="text-purple me-2" /> Company-wide leave policies</li>
                  <li><FiCheckCircle className="text-purple me-2" /> Reports, audit logs & analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Accounts Section */}
        <section id="demo-access" className="mb-5">
          <div className="card border-0 bg-white shadow-sm rounded-4 p-4 p-md-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-6">
                <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-2">
                  Quick Demo Access
                </span>
                <h3 className="fw-bold text-dark mb-2">Pre-Configured Demo Credentials</h3>
                <p className="text-muted small mb-4">
                  Use these seeded accounts to test each role's dashboard, permissions, and operational flows directly.
                </p>

                <div className="d-flex flex-column gap-3">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-secondary text-white px-2 py-1">HR Administrator</span>
                      <code className="text-muted small">Full Governance</code>
                    </div>
                    <div className="small"><strong>Email:</strong> admin@staffsync.com</div>
                    <div className="small"><strong>Password:</strong> Admin123!</div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-success text-white px-2 py-1">Department Manager</span>
                      <code className="text-muted small">Supervisory Oversight</code>
                    </div>
                    <div className="small"><strong>Email:</strong> manager@staffsync.com</div>
                    <div className="small"><strong>Password:</strong> Manager123!</div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-primary text-white px-2 py-1">Staff Employee</span>
                      <code className="text-muted small">Self-Service Portal</code>
                    </div>
                    <div className="small"><strong>Email:</strong> employee@staffsync.com</div>
                    <div className="small"><strong>Password:</strong> Employee123!</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 text-center text-lg-start ps-lg-5">
                <div className="p-4 bg-light rounded-4 border">
                  <h5 className="fw-bold text-dark mb-2">Ready to Experience StaffSync?</h5>
                  <p className="text-muted small mb-4">
                    Sign in to any demo account above or register a new employee to get started right away.
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-lg-start">
                    <Link to="/login" className="btn btn-primary px-4 fw-medium shadow-sm d-flex align-items-center justify-content-center gap-2">
                      <FiLogIn /> Sign In Now
                    </Link>
                    <Link to="/register" className="btn btn-outline-primary px-4 fw-medium d-flex align-items-center justify-content-center gap-2">
                      <FiUserPlus /> Register Employee
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack Pills */}
        <section className="text-center py-4 bg-white rounded-3 border p-4 shadow-sm">
          <div className="text-muted small text-uppercase fw-semibold mb-3 tracking-wider">
            Built with Modern Full-Stack Technologies
          </div>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            <span className="tech-pill">🍃 MongoDB & Mongoose</span>
            <span className="tech-pill">⚡ Express.js</span>
            <span className="tech-pill">⚛️ React 18 & Vite</span>
            <span className="tech-pill">🟢 Node.js</span>
            <span className="tech-pill">🎨 Bootstrap 5</span>
            <span className="tech-pill">📦 Redux Toolkit</span>
            <span className="tech-pill">🛡️ JWT & Bcrypt</span>
            <span className="tech-pill">🌐 Axios Interceptors</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 mt-auto bg-white border-top">
        <div className="container text-center small">
          <p className="mb-1 fw-semibold text-dark">
            StaffSync — Modern Human Resource Management System
          </p>
          <p className="text-muted mb-0">
            Production Ready Full-Stack MERN Architecture • Secure • Reliable • Scalable
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
