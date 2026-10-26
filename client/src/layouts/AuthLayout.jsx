import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShield } from 'react-icons/fi';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Simple Header */}
      <nav className="navbar navbar-light bg-white border-bottom py-3">
        <div className="container">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="icon-box icon-box-blue" style={{ width: '38px', height: '38px' }}>
              <FiUsers size={20} />
            </div>
            <span className="fs-4 fw-bold text-dark tracking-tight">
              Staff<span className="text-primary">Sync</span>
            </span>
          </Link>
          <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill small">
            <FiShield className="me-1 text-primary" /> Role-Based Access Control
          </span>
        </div>
      </nav>

      {/* Center Auth Card */}
      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 col-xl-4">
            <div className="card shadow-sm border rounded-3 p-4 bg-white">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark mb-1">{title}</h4>
                {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 mt-auto bg-white border-top text-center small text-muted">
        StaffSync Modern HRMS &bull; Enterprise Human Resource Management
      </footer>
    </div>
  );
};

export default AuthLayout;
