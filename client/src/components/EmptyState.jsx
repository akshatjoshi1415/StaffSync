import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'No records found', message = 'There is currently no data to display.', icon: Icon = FiInbox, action }) => {
  return (
    <div className="card border-0 bg-white shadow-sm p-5 text-center my-3 rounded-3">
      <div className="d-flex justify-content-center mb-3">
        <div className="icon-box icon-box-blue" style={{ width: '56px', height: '56px', fontSize: '1.75rem' }}>
          <Icon />
        </div>
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '420px' }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
