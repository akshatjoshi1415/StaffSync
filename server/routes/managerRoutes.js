const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getTeamMembers,
  getTeamAttendance,
  getTeamLeaves
} = require('../controllers/managerController');

// All manager routes require manager role
router.use(authenticate);
router.use(authorize('manager'));

router.get('/team', getTeamMembers);
router.get('/attendance', getTeamAttendance);
router.get('/leaves', getTeamLeaves);

module.exports = router;
