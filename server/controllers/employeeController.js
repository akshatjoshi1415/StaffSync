const Employee = require('../models/Employee');
const User = require('../models/User');
const generateUniqueEmployeeId = require('../utils/generateEmployeeId');

// Helper to get or create employee document for user
const getOrCreateEmployee = async (user) => {
  let employee = await Employee.findOne({ user: user._id }).populate('manager', 'fullName email');
  if (!employee) {
    const employeeId = await generateUniqueEmployeeId();
    employee = await Employee.create({
      employeeId,
      user: user._id,
      department: 'General',
      designation: 'Staff Member',
      joiningDate: new Date()
    });
    employee = await Employee.findById(employee._id).populate('manager', 'fullName email');
  }
  return employee;
};

/**
 * Get profile for logged-in employee
 * @route GET /api/employee/profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployee(req.user);
    res.status(200).json({
      success: true,
      profile: {
        id: employee._id,
        employeeId: employee.employeeId,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        department: employee.department,
        designation: employee.designation,
        phone: employee.phone,
        joiningDate: employee.joiningDate,
        manager: employee.manager
          ? {
              id: employee.manager._id,
              fullName: employee.manager.fullName,
              email: employee.manager.email
            }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permitted profile fields for logged-in employee
 * @route PUT /api/employee/profile
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;

    // Update user's full name if provided
    if (fullName && fullName.trim().length >= 2) {
      await User.findByIdAndUpdate(req.user._id, { fullName: fullName.trim() });
    }

    // Update employee phone
    const employee = await getOrCreateEmployee(req.user);
    if (phone !== undefined) {
      employee.phone = phone.trim();
      await employee.save();
    }

    const updatedUser = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: employee._id,
        employeeId: employee.employeeId,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        department: employee.department,
        designation: employee.designation,
        phone: employee.phone,
        joiningDate: employee.joiningDate,
        manager: employee.manager
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getOrCreateEmployee
};
