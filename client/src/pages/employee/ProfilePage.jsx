import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import api from '../../services/api';
import { loadUser } from '../../store/authSlice';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiSave
} from 'react-icons/fi';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employee/profile');
      setProfile(res.data.profile);
      setFormData({
        fullName: res.data.profile.fullName || '',
        phone: res.data.profile.phone || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employee profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.put('/employee/profile', formData);
      setMessage(res.data.message || 'Profile updated successfully.');
      setProfile(res.data.profile);
      // Reload user in Redux store to reflect updated fullName
      dispatch(loadUser());
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Personal Profile"
        subtitle="Manage your contact information and review departmental credentials"
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading profile...</span>
          </div>
        </div>
      ) : profile && (
        <div className="row g-4">
          {/* Editable Personal Contact Info */}
          <div className="col-lg-7">
            <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <FiUser className="text-primary" /> Edit Personal Information
              </h5>
              <p className="text-muted small mb-4">
                You may update your legal display name and direct phone number. Departmental assignments are managed by HR.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <FiUser />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Work Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <FiMail />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={profile.email}
                      disabled
                      title="Email addresses can only be modified by HR Administration"
                    />
                  </div>
                  <div className="form-text small">Email cannot be changed directly.</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <FiPhone />
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. +1 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 shadow-sm"
                >
                  <FiSave /> {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Departmental & Organizational Credentials (Read-only) */}
          <div className="col-lg-5">
            <div className="card border-0 bg-white shadow-sm p-4 rounded-3 h-100">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <FiBriefcase className="text-primary" /> Employment Record
              </h5>
              <p className="text-muted small mb-3">
                Official StaffSync employment credentials. Contact HR for assignment adjustments.
              </p>

              <ul className="list-group list-group-flush small">
                <li className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Employee ID</span>
                  <span className="badge bg-light text-dark border fw-bold">{profile.employeeId}</span>
                </li>
                <li className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Department</span>
                  <span className="fw-semibold text-dark">{profile.department}</span>
                </li>
                <li className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Designation</span>
                  <span className="fw-semibold text-dark">{profile.designation}</span>
                </li>
                <li className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Assigned Manager</span>
                  <span className="fw-semibold text-dark">
                    {profile.manager ? profile.manager.fullName : 'None Assigned'}
                  </span>
                </li>
                <li className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Joining Date</span>
                  <span className="fw-semibold text-dark">
                    {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '—'}
                  </span>
                </li>
                <li className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-muted">System Role</span>
                  <span className="badge bg-primary-subtle text-primary text-uppercase">{profile.role}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;
