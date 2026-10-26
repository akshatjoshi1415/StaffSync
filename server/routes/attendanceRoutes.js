const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance
} = require('../controllers/attendanceController');

// All attendance routes require authentication
router.use(authenticate);

// Employee attendance actions
router.post('/check-in', authorize('employee'), checkIn);
router.post('/check-out', authorize('employee'), checkOut);
router.get('/today', authorize('employee'), getTodayAttendance);
router.get('/my', authorize('employee'), getMyAttendance);

module.exports = router;
