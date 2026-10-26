const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllManagers,
  createManager,
  updateManager,
  getAllAttendance,
  getAllLeaves,
  getReports
} = require('../controllers/hrController');

router.use(authenticate);

// Special case: Manager list can be viewed by managers and HR (e.g. for assignments)
router.get('/managers', authorize('hr', 'manager'), getAllManagers);

// All other routes strictly require HR role
router.use(authorize('hr'));

// Employee management
router.get('/employees', getAllEmployees);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Manager management
router.post('/managers', createManager);
router.put('/managers/:id', updateManager);

// Organization Attendance & Leaves
router.get('/attendance', getAllAttendance);
router.get('/leaves', getAllLeaves);

// Summary Reports
router.get('/reports', getReports);

module.exports = router;
