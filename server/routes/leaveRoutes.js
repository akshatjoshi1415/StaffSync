const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  applyLeave,
  getMyLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');

router.use(authenticate);

// Employee leave endpoints
router.post('/', authorize('employee'), applyLeave);
router.get('/my', authorize('employee'), getMyLeaves);

// Manager & HR status review endpoint
router.put('/:id/status', authorize('manager', 'hr'), updateLeaveStatus);

module.exports = router;
