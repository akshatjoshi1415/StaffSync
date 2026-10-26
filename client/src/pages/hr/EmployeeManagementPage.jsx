import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiUser
} from 'react-icons/fi';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '',
    managerId: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, mgrRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/managers')
      ]);
      setEmployees(empRes.data.employees || []);
      setManagers(mgrRes.data.managers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      employeeId: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '',
      managerId: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.user?.fullName || '',
      email: emp.user?.email || '',
      password: '',
      employeeId: emp.employeeId,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone || '',
      managerId: emp.manager?._id || '',
      isActive: emp.user?.isActive ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (editingEmployee) {
        // Update employee
        const res = await api.put(`/hr/employees/${editingEmployee._id}`, {
          fullName: formData.fullName,
          department: formData.department,
          designation: formData.designation,
          phone: formData.phone,
          managerId: formData.managerId || null,
          isActive: formData.isActive
        });
        setMessage(res.data.message || 'Employee updated successfully.');
      } else {
        // Create employee
        const res = await api.post('/hr/employees', formData);
        setMessage(res.data.message || 'Employee created successfully.');
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove employee "${name}"? This will deactivate their portal access.`)) return;
    try {
      await api.delete(`/hr/employees/${id}`);
      setMessage('Employee record removed successfully.');
      fetchData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove employee.');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Employee Directory & Management"
        subtitle="Provision employee accounts, assign managers, and update departmental titles"
        action={
          <button onClick={openCreateModal} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <FiPlus /> Add Employee
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
          <FiUsers className="text-primary" /> Employees ({employees.length})
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading employees...</span>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="No employees registered"
            message="Click 'Add Employee' to create employee profiles and user accounts."
            action={
              <button onClick={openCreateModal} className="btn btn-sm btn-primary">
                Add First Employee
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <span className="badge bg-light text-dark border fw-bold">{emp.employeeId}</span>
                    </td>
                    <td className="fw-semibold text-dark">{emp.user?.fullName}</td>
                    <td>
                      <a href={`mailto:${emp.user?.email}`} className="text-decoration-none text-secondary small d-flex align-items-center gap-1">
                        <FiMail size={13} /> {emp.user?.email}
                      </a>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>
                      {emp.manager ? (
                        <span className="small text-dark fw-medium">{emp.manager.fullName}</span>
                      ) : (
                        <span className="text-muted small fst-italic">None</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={emp.user?.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="btn btn-outline-secondary btn-sm me-1 p-1"
                        title="Edit Record"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id, emp.user?.fullName)}
                        className="btn btn-outline-danger btn-sm p-1"
                        title="Delete / Deactivate"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingEmployee ? 'Edit Employee Record' : 'Add New Employee'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Smith"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Work Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="john.smith@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!!editingEmployee}
                        required
                      />
                    </div>
                  </div>

                  {!editingEmployee && (
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Initial Password (min. 8 characters)</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Temporary password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Custom Employee ID (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Leave blank for auto EMP-XXXX"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Engineering, HR, Sales"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Junior Developer, QA Analyst"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Assigned Manager</label>
                      <select
                        className="form-select"
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      >
                        <option value="">No Manager Assigned</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName} ({m.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+1 555-0123"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {editingEmployee && (
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="activeStatusSwitch"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="activeStatusSwitch">
                        Active Account (Deactivate to revoke login permissions)
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
                    {submitting ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Create Employee'}
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

export default EmployeeManagementPage;
