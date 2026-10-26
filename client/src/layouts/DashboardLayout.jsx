import React from 'react';
import AppNavbar from '../components/AppNavbar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AppNavbar />
      <main className="container-fluid px-lg-4 my-4 flex-grow-1">
        {children}
      </main>
      <footer className="py-3 bg-white border-top text-center small text-muted">
        StaffSync — Modern Human Resource Management System &bull; College Project Demonstration
      </footer>
    </div>
  );
};

export default DashboardLayout;
