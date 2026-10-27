const User = require('../models/User');
const Employee = require('../models/Employee');
const generateUniqueEmployeeId = require('../utils/generateEmployeeId');
const { generateToken, getCookieOptions } = require('../utils/generateToken');

/**
 * Register a new employee account (Public).
 * Privileged accounts (HR, Manager) cannot be created through this endpoint.
 *
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if an account already exists with this email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Always assign 'employee' role for public registration
    const user = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: 'employee',
      isActive: true
    });

    await user.save();

    // Automatically create linked Employee profile
    const employeeId = await generateUniqueEmployeeId();
    await Employee.create({
      employeeId,
      user: user._id,
      department: 'General',
      designation: 'Staff Member',
      joiningDate: new Date()
    });

    // Generate JWT and set secure HTTP-only cookie
    const token = generateToken(user._id, user.role);
    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'Employee registration successful',
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Handle Mongoose duplicate key error (code 11000) safely
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }
    next(error);
  }
};

/**
 * Log in an existing user with email and password.
 *
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Retrieve user including password field for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Generic error message prevents account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Reject inactive accounts
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact HR administration.'
      });
    }

    // Generate token and set HTTP-only cookie
    const token = generateToken(user._id, user.role);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile.
 *
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  let employeeProfile = null;
  if (req.user.role === 'employee') {
    employeeProfile = await Employee.findOne({ user: req.user._id }).populate('manager', 'fullName email');
  }

  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id.toString(),
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      employeeProfile
    }
  });
};

/**
 * Log out user by clearing the authentication cookie.
 *
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
const logout = async (req, res) => {
  const cookieOptions = getCookieOptions();
  // Clear cookie using matching options
  res.clearCookie('token', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path
  });

  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
