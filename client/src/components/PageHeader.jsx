import React from 'react';

const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="card border-0 bg-white shadow-sm p-4 mb-4 rounded-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">{title}</h3>
          {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
