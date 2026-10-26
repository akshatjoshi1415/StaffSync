const express = require('express');
const router = express.Router();

const { register, login, getMe, logout } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/authValidation');
const authenticate = require('../middleware/authenticate');

// Public authentication routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected user verification route
router.get('/me', authenticate, getMe);

module.exports = router;
