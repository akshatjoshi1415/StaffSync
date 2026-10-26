const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * Diagnostic Protected Verification Routes
 * Verifies role-based access control (RBAC).
 */

// Any authenticated user
router.get('/protected', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Authenticated user verified',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// HR-only access
router.get('/hr', authenticate, authorize('hr'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: HR authorization confirmed',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Manager-only access
router.get('/manager', authenticate, authorize('manager'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Manager authorization confirmed',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Employee-only access
router.get('/employee', authenticate, authorize('employee'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Employee authorization confirmed',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
