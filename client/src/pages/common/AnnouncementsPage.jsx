import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiClock, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const AnnouncementsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({ title: item.title, content: item.content });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, formData);
        setSuccessMsg('Announcement updated successfully.');
      } else {
        await api.post('/announcements', formData);
        setSuccessMsg('Announcement published successfully.');
      }
      setShowModal(false);
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setSuccessMsg('Announcement deleted successfully.');
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Company Announcements"
        subtitle="Organization-wide notices, updates, and HR communications"
        action={
          isHR && (
            <button onClick={openCreateModal} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
              <FiPlus /> New Announcement
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
            <span className="visually-hidden">Loading announcements...</span>
          </div>
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="No announcements published yet"
          message="Important company updates and news will appear here once posted."
          action={
            isHR && (
              <button onClick={openCreateModal} className="btn btn-sm btn-primary">
                Post First Announcement
              </button>
            )
          }
        />
      ) : (
        <div className="row g-3">
          {announcements.map((item) => (
            <div key={item._id} className="col-12">
              <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold text-dark mb-1">{item.title}</h5>
                  {isHR && (
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-outline-secondary btn-sm"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-secondary mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                  {item.content}
                </p>

                <div className="d-flex align-items-center gap-3 text-muted small border-top pt-2">
                  <span className="d-flex align-items-center gap-1">
                    <FiUser className="text-primary" /> {item.author?.fullName || 'HR Administration'}
                  </span>
                  <span>&bull;</span>
                  <span className="d-flex align-items-center gap-1">
                    <FiClock /> {new Date(item.createdAt).toLocaleDateString()} at{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HR Modal for Create / Edit */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Announcement' : 'Publish Announcement'}
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
                    <label className="form-label fw-semibold small">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Office Closed on Memorial Day"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Content</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Write the announcement details here..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Publish'}
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

export default AnnouncementsPage;
