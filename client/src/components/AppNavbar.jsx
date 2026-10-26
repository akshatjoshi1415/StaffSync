import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiBell,
  FiBookOpen,
  FiUser,
  FiCheckSquare,
  FiBarChart2,
  FiLogOut,
  FiHome,
  FiShield
} from 'react-icons/fi';

const AppNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-2 bg-white border-bottom shadow-sm">
      <div className="container-fluid px-lg-4">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-4">
          <div className="icon-box icon-box-blue" style={{ width: '34px', height: '34px', fontSize: '1.1rem' }}>
            <FiUsers />
          </div>
          <span className="fs-5 fw-bold text-dark tracking-tight">
            Staff<span className="text-primary">Sync</span>
          </span>
          <span className="badge bg-light text-secondary border ms-1 text-uppercase" style={{ fontSize: '0.68rem' }}>
            {user.role}
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#staffsync-nav"
          aria-controls="staffsync-nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="staffsync-nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            {/* Employee Nav Links */}
            {user.role === 'employee' && (
              <>
                <li className="nav-item">
                  <NavLink to="/employee/dashboard" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiHome /> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/employee/attendance" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiClock /> Attendance
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/employee/leaves" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiCalendar /> Leaves
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/employee/announcements" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiBell /> Announcements
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/employee/trainings" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiBookOpen /> Training
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/employee/profile" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiUser /> Profile
                  </NavLink>
                </li>
              </>
            )}

            {/* Manager Nav Links */}
            {user.role === 'manager' && (
              <>
                <li className="nav-item">
                  <NavLink to="/manager/dashboard" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiHome /> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/manager/team" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiUsers /> Team Members
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/manager/attendance" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiClock /> Team Attendance
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/manager/leaves" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiCheckSquare /> Leave Approvals
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/manager/trainings" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiBookOpen /> Training Management
                  </NavLink>
                </li>
              </>
            )}

            {/* HR Nav Links */}
            {user.role === 'hr' && (
              <>
                <li className="nav-item">
                  <NavLink to="/hr/dashboard" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiHome /> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/employees" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiUsers /> Employees
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/managers" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiShield /> Managers
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/attendance" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiClock /> Attendance
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/leaves" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiCalendar /> Leaves
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/announcements" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiBell /> Announcements
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/reports" className={({ isActive }) => `nav-link px-2 py-1 rounded d-flex align-items-center gap-1 ${isActive ? 'fw-bold text-primary active' : 'text-secondary'}`}>
                    <FiBarChart2 /> Reports
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Right user & logout */}
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-semibold text-dark small">{user.fullName}</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 shadow-sm"
              title="Sign Out"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
