import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import {
  FiShield,
  FiPlus,
  FiEdit2,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiMail
} from 'react-icons/fi';

const ManagerManagementPage = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hr/managers');
      setManagers(res.data.managers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load managers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const openCreateModal = () => {
    setEditingManager(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (mgr) => {
    setEditingManager(mgr);
    setFormData({
      fullName: mgr.fullName,
      email: mgr.email,
      password: '',
      isActive: mgr.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (editingManager) {
        const res = await api.put(`/hr/managers/${editingManager.id}`, {
          fullName: formData.fullName,
          isActive: formData.isActive
        });
        setMessage(res.data.message || 'Manager updated successfully.');
      } else {
        const res = await api.post('/hr/managers', formData);
        setMessage(res.data.message || 'Manager account created successfully.');
      }
      setShowModal(false);
      fetchManagers();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Manager Accounts Management"
        subtitle="Provision department managers and team leaders with supervisory permissions"
        action={
          <button onClick={openCreateModal} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <FiPlus /> Add Manager
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

      <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FiShield className="text-primary" /> Managers ({managers.length})
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading managers...</span>
            </div>
          </div>
        ) : managers.length === 0 ? (
          <EmptyState
            icon={FiShield}
            title="No manager accounts created yet"
            message="Create manager profiles to delegate employee attendance and leave approval responsibilities."
            action={
              <button onClick={openCreateModal} className="btn btn-sm btn-primary">
                Create First Manager
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Manager Name</th>
                  <th>Email</th>
                  <th>Assigned Direct Reports</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((mgr) => (
                  <tr key={mgr.id}>
                    <td className="fw-bold text-dark">{mgr.fullName}</td>
                    <td>
                      <a href={`mailto:${mgr.email}`} className="text-decoration-none text-secondary small d-flex align-items-center gap-1">
                        <FiMail size={13} /> {mgr.email}
                      </a>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border">
                        <FiUsers className="me-1" /> {mgr.teamCount} employees
                      </span>
                    </td>
                    <td className="small text-muted">{new Date(mgr.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={mgr.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => openEditModal(mgr)}
                        className="btn btn-outline-secondary btn-sm p-1"
                        title="Edit Manager"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Manager Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingManager ? 'Edit Manager Record' : 'Create Manager Account'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sarah Connor"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Work Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. sarah.connor@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!!editingManager}
                      required
                    />
                  </div>

                  {!editingManager && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Password (min. 8 characters)</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Secure password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                      />
                    </div>
                  )}

                  {editingManager && (
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="activeMgrSwitch"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="activeMgrSwitch">
                        Active Account (Deactivate to revoke login access)
                      </label>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : editingManager ? 'Save Changes' : 'Create Manager'}
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

export default ManagerManagementPage;
