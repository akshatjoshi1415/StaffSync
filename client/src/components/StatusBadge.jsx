import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toString().toLowerCase();

  let badgeClass = 'bg-secondary';
  if (['present', 'approved', 'active'].includes(normalized)) {
    badgeClass = 'bg-success';
  } else if (['late', 'pending', 'half-day'].includes(normalized)) {
    badgeClass = 'bg-warning text-dark';
  } else if (['rejected', 'inactive'].includes(normalized)) {
    badgeClass = 'bg-danger';
  }

  return (
    <span className={`badge ${badgeClass} px-2 py-1 fw-semibold`} style={{ fontSize: '0.75rem' }}>
      {status}
    </span>
  );
};

export default StatusBadge;
