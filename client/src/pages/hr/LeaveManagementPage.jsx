import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import {
  FiCalendar,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiUser
} from 'react-icons/fi';

const LeaveManagementPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Review decision modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decision, setDecision] = useState('Approved');
  const [comment, setComment] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hr/leaves');
      setLeaves(res.data.leaves || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organization leaves.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openDecisionModal = (leave, status) => {
    setSelectedLeave(leave);
    setDecision(status);
    setComment('');
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.put(`/leaves/${selectedLeave._id}/status`, {
        status: decision,
        reviewComment: comment
      });
      setMessage(res.data.message || `Leave ${decision.toLowerCase()} successfully.`);
      setSelectedLeave(null);
      fetchLeaves();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLeaves =
    filter === 'All' ? leaves : leaves.filter((l) => l.status === filter);

  return (
    <DashboardLayout>
      <PageHeader
        title="Leave Governance & Requests"
        subtitle="Review, approve, or reject employee leave requests across all company departments"
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

      <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
        {/* Filter Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <FiCalendar className="text-primary" /> All Leave Applications ({filteredLeaves.length})
          </h5>

          <div className="btn-group btn-group-sm">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`btn ${filter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading leaves...</span>
            </div>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <EmptyState
            icon={FiCalendar}
            title={`No ${filter !== 'All' ? filter.toLowerCase() : ''} leave requests`}
            message="Submitted time-off applications from employees will appear here."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Decision Log</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="fw-bold text-dark">{leave.user?.fullName || 'Unknown'}</div>
                      <div className="text-muted small">{leave.employee?.employeeId} &bull; {leave.employee?.department}</div>
                    </td>
                    <td className="fw-semibold text-secondary">{leave.leaveType}</td>
                    <td>
                      <div className="small">
                        {new Date(leave.startDate).toLocaleDateString()} &rarr;{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ maxWidth: '220px' }} className="text-truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td>
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="small text-muted">
                      {leave.reviewedBy ? (
                        <div>
                          <span className="fw-semibold text-dark">{leave.reviewedBy.fullName}</span>
                          {leave.reviewComment && <div className="fst-italic text-truncate" style={{ maxWidth: '180px' }}>"{leave.reviewComment}"</div>}
                        </div>
                      ) : (
                        <span className="fst-italic">Pending</span>
                      )}
                    </td>
                    <td className="text-end">
                      {leave.status === 'Pending' ? (
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            onClick={() => openDecisionModal(leave, 'Approved')}
                            className="btn btn-sm btn-success px-2 py-0"
                            title="Approve Leave"
                          >
                            <FiCheck size={14} /> Approve
                          </button>
                          <button
                            onClick={() => openDecisionModal(leave, 'Rejected')}
                            className="btn btn-sm btn-outline-danger px-2 py-0"
                            title="Reject Leave"
                          >
                            <FiX size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openDecisionModal(leave, leave.status === 'Approved' ? 'Rejected' : 'Approved')}
                          className="btn btn-sm btn-outline-secondary px-2 py-0"
                          title="Override Decision"
                        >
                          Change
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedLeave && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  HR Review: {decision === 'Approved' ? 'Approve' : 'Reject'} Leave
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedLeave(null)}
                ></button>
              </div>
              <form onSubmit={submitDecision}>
                <div className="modal-body">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div><strong>Employee:</strong> {selectedLeave.user?.fullName} ({selectedLeave.employee?.employeeId})</div>
                    <div><strong>Leave Type:</strong> {selectedLeave.leaveType}</div>
                    <div>
                      <strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} &rarr; {new Date(selectedLeave.endDate).toLocaleDateString()}
                    </div>
                    <div><strong>Reason:</strong> {selectedLeave.reason}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">HR Decision Note / Justification</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={
                        decision === 'Approved'
                          ? 'e.g. Approved per annual leave balance policy.'
                          : 'e.g. Denied due to staffing constraints.'
                      }
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedLeave(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`btn ${decision === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                  >
                    {actionLoading ? 'Updating...' : `Confirm ${decision}`}
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

export default LeaveManagementPage;
