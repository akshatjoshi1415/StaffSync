import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import {
  FiBookOpen,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const TrainingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canManage = user?.role === 'manager' || user?.role === 'hr';

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form / Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule: '',
    department: 'All Departments'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainings');
      setTrainings(res.data.trainings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load training programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      schedule: '',
      department: 'All Departments'
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      schedule: item.schedule ? new Date(item.schedule).toISOString().slice(0, 16) : '',
      department: item.department || 'All Departments'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.schedule) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await api.put(`/trainings/${editingId}`, formData);
        setSuccessMsg('Training program updated successfully.');
      } else {
        await api.post('/trainings', formData);
        setSuccessMsg('Training program created successfully.');
      }
      setShowModal(false);
      fetchTrainings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) return;
    try {
      await api.delete(`/trainings/${id}`);
      setSuccessMsg('Training program deleted successfully.');
      fetchTrainings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete training program.');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Training & Development Programs"
        subtitle="Skill enhancement workshops, onboarding courses, and compliance sessions"
        action={
          canManage && (
            <button onClick={openCreateModal} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
              <FiPlus /> New Training Session
            </button>
          )
        }
      />

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiCheckCircle /> <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3">
          <FiAlertCircle /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading training programs...</span>
          </div>
        </div>
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={FiBookOpen}
          title="No training programs scheduled"
          message="Upcoming professional development sessions and skill courses will appear here."
          action={
            canManage && (
              <button onClick={openCreateModal} className="btn btn-sm btn-primary">
                Schedule First Training
              </button>
            )
          }
        />
      ) : (
        <div className="row g-3">
          {trainings.map((item) => (
            <div key={item._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 bg-white shadow-sm p-4 rounded-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-primary border fw-semibold">
                      <FiBriefcase className="me-1" /> {item.department || 'All Departments'}
                    </span>
                    {canManage && (
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-outline-secondary btn-sm p-1"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn btn-outline-danger btn-sm p-1"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                  <p className="text-muted small mb-3">{item.description}</p>
                </div>

                <div className="border-top pt-2 mt-auto small text-secondary">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FiCalendar className="text-primary" />
                    <strong>Schedule:</strong> {new Date(item.schedule).toLocaleDateString()} at{' '}
                    {new Date(item.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FiUser className="text-muted" />
                    <span>Organized by {item.createdBy?.fullName || 'Manager'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manager / HR Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Training Session' : 'Schedule Training Session'}
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
                    <label className="form-label fw-semibold small">Training Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Modern React Design Patterns"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Department Focus</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Engineering, Sales, or All Departments"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Summary of course objectives, agenda, and requirements..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
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
                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Schedule'}
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

export default TrainingsPage;
