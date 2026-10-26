const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { getMyProfile, updateMyProfile } = require('../controllers/employeeController');

// All employee profile routes require authentication and employee role
router.use(authenticate);
router.use(authorize('employee'));

router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

module.exports = router;
