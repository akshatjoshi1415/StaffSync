import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import api from '../../services/api';
import {
  FiBarChart2,
  FiUsers,
  FiShield,
  FiClock,
  FiCalendar,
  FiLayers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';

const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hr/reports');
      setReports(res.data.reports);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Human Resource Analytics & Reports"
        subtitle="Consolidated metrics on workforce headcount, daily attendance turnout, and leave processing"
      />

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Calculating reports...</span>
          </div>
        </div>
      ) : reports && (
        <>
          {/* Key Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-blue">
                    <FiUsers />
                  </div>
                  <div>
                    <div className="text-muted small">Total Employees</div>
                    <div className="fw-bold fs-3 text-dark">{reports.totalEmployees}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-purple">
                    <FiShield />
                  </div>
                  <div>
                    <div className="text-muted small">Department Managers</div>
                    <div className="fw-bold fs-3 text-dark">{reports.totalManagers}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-teal">
                    <FiClock />
                  </div>
                  <div>
                    <div className="text-muted small">Present Today</div>
                    <div className="fw-bold fs-3 text-success">{reports.todayPresentCount}</div>
                  </div>
                </div>
                <div className="text-muted small mt-2">
                  Total logs on record: <strong>{reports.totalAttendanceRecords}</strong>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box icon-box-orange">
                    <FiCalendar />
                  </div>
                  <div>
                    <div className="text-muted small">Pending Leaves</div>
                    <div className="fw-bold fs-3 text-warning">{reports.leaves?.pending || 0}</div>
                  </div>
                </div>
                <div className="text-muted small mt-2">
                  Total requests: <strong>{reports.leaves?.total || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Leave Decision Breakdown */}
            <div className="col-lg-6">
              <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <FiCalendar className="text-primary" /> Leave Requests Processing
                </h5>

                <div className="d-flex flex-column gap-3">
                  <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <FiClock className="text-warning" />
                      <span className="fw-semibold text-dark">Pending Review</span>
                    </div>
                    <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                      {reports.leaves?.pending || 0}
                    </span>
                  </div>

                  <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle className="text-success" />
                      <span className="fw-semibold text-dark">Approved Leaves</span>
                    </div>
                    <span className="badge bg-success px-3 py-2 fs-6">
                      {reports.leaves?.approved || 0}
                    </span>
                  </div>

                  <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <FiXCircle className="text-danger" />
                      <span className="fw-semibold text-dark">Rejected Leaves</span>
                    </div>
                    <span className="badge bg-danger px-3 py-2 fs-6">
                      {reports.leaves?.rejected || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Workforce Distribution */}
            <div className="col-lg-6">
              <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <FiLayers className="text-primary" /> Department Distribution
                </h5>

                {reports.departmentBreakdown?.length === 0 ? (
                  <p className="text-muted small my-auto">No departmental records found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small text-secondary">
                        <tr>
                          <th>Department</th>
                          <th className="text-end">Staff Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.departmentBreakdown?.map((dept, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold text-dark">{dept.department}</td>
                            <td className="text-end">
                              <span className="badge bg-light text-primary border px-2 py-1">
                                {dept.count} members
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ReportsPage;
