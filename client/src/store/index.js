import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer
    // Future reducers: employees, attendance, leaves, etc.
  }
});

export default store;
