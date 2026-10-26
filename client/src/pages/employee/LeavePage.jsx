import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import {
  FiCalendar,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiClock,
  FiUserCheck
} from 'react-icons/fi';

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves/my');
      setLeaves(res.data.leaves || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setError('Please provide start date, end date, and reason.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/leaves', formData);
      setMessage(res.data.message || 'Leave application submitted successfully.');
      setShowApplyModal(false);
      setFormData({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchLeaves();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Leave Management"
        subtitle="Submit time-off requests and track application approval status"
        action={
          <button
            onClick={() => {
              setError(null);
              setShowApplyModal(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          >
            <FiPlus /> Apply for Leave
          </button>
        }
      />

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiCheckCircle /> <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiAlertCircle /> <span>{error}</span>
        </div>
      )}

      {/* Leave Application History Table */}
      <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FiCalendar className="text-primary" /> My Leave Requests
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading leave requests...</span>
            </div>
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={FiCalendar}
            title="No leave requests submitted"
            message="Apply for sick leaves, personal days, or annual vacations using the button above."
            action={
              <button onClick={() => setShowApplyModal(true)} className="btn btn-sm btn-primary">
                Submit Your First Request
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewer Feedback</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="fw-semibold text-dark">{leave.leaveType}</td>
                    <td>
                      <div className="small">
                        {new Date(leave.startDate).toLocaleDateString()} &rarr;{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ maxWidth: '250px' }} className="text-truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td>
                      <StatusBadge status={leave.status} />
                    </td>
                    <td>
                      {leave.reviewedBy ? (
                        <div className="small">
                          <span className="d-flex align-items-center gap-1 text-dark fw-medium">
                            <FiUserCheck className="text-primary" /> {leave.reviewedBy.fullName}
                          </span>
                          {leave.reviewComment && (
                            <span className="text-muted fst-italic">"{leave.reviewComment}"</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted small fst-italic">Pending manager review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Apply for Leave</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApplyModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Leave Category</label>
                    <select
                      className="form-select"
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                      required
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Paid Leave">Paid Leave</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Reason for Leave</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Briefly state the reason for your time-off request..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LeavePage;
