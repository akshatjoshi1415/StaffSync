import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './store/authSlice';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore authenticated session from HTTP-only cookie on application boot
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
