const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const generateUniqueEmployeeId = require('../utils/generateEmployeeId');

/**
 * Get all employees
 * @route GET /api/hr/employees
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find()
      .populate('user', 'fullName email isActive createdAt')
      .populate('manager', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new employee account + profile (HR only)
 * @route POST /api/hr/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const { fullName, email, password, employeeId, department, designation, phone, joiningDate, managerId } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Auto-generate employeeId if not provided
    let empId = employeeId ? employeeId.trim().toUpperCase() : null;
    if (!empId) {
      empId = await generateUniqueEmployeeId();
    } else {
      const existingEmp = await Employee.findOne({ employeeId: empId });
      if (existingEmp) {
        return res.status(409).json({
          success: false,
          message: `Employee ID '${empId}' is already in use.`
        });
      }
    }

    // Create User record
    const user = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: 'employee',
      isActive: true
    });
    await user.save();

    // Create Employee record
    const employee = await Employee.create({
      employeeId: empId,
      user: user._id,
      department: department ? department.trim() : 'General',
      designation: designation ? designation.trim() : 'Staff Member',
      phone: phone ? phone.trim() : '',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      manager: managerId || null
    });

    const populated = await Employee.findById(employee._id)
      .populate('user', 'fullName email isActive createdAt')
      .populate('manager', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Employee account and profile created successfully',
      employee: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee record (HR only)
 * @route PUT /api/hr/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, department, designation, phone, joiningDate, managerId, isActive } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.'
      });
    }

    // Update user record if fullName or isActive is supplied
    if (fullName || isActive !== undefined) {
      const userUpdate = {};
      if (fullName) userUpdate.fullName = fullName.trim();
      if (isActive !== undefined) userUpdate.isActive = Boolean(isActive);
      await User.findByIdAndUpdate(employee.user, userUpdate);
    }

    if (department) employee.department = department.trim();
    if (designation) employee.designation = designation.trim();
    if (phone !== undefined) employee.phone = phone.trim();
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (managerId !== undefined) employee.manager = managerId || null;

    await employee.save();

    const populated = await Employee.findById(employee._id)
      .populate('user', 'fullName email isActive createdAt')
      .populate('manager', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / deactivate employee (HR only)
 * @route DELETE /api/hr/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.'
      });
    }

    // Deactivate user rather than breaking foreign references
    await User.findByIdAndUpdate(employee.user, { isActive: false });
    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Employee removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all managers (HR & Managers can view list for assignment)
 * @route GET /api/hr/managers
 */
const getAllManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: 'manager' })
      .select('fullName email isActive createdAt')
      .sort({ fullName: 1 });

    // Include count of employees assigned to each manager
    const managersWithCount = await Promise.all(
      managers.map(async (m) => {
        const teamCount = await Employee.countDocuments({ manager: m._id });
        return {
          id: m._id,
          fullName: m.fullName,
          email: m.email,
          isActive: m.isActive,
          createdAt: m.createdAt,
          teamCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: managersWithCount.length,
      managers: managersWithCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new manager account (HR only)
 * @route POST /api/hr/managers
 */
const createManager = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const manager = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: 'manager',
      isActive: true
    });

    await manager.save();

    res.status(201).json({
      success: true,
      message: 'Manager account created successfully',
      manager: {
        id: manager._id,
        fullName: manager.fullName,
        email: manager.email,
        role: manager.role,
        isActive: manager.isActive,
        createdAt: manager.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update manager status / details (HR only)
 * @route PUT /api/hr/managers/:id
 */
const updateManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, isActive } = req.body;

    const manager = await User.findOne({ _id: id, role: 'manager' });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found.'
      });
    }

    if (fullName) manager.fullName = fullName.trim();
    if (isActive !== undefined) manager.isActive = Boolean(isActive);

    await manager.save();

    res.status(200).json({
      success: true,
      message: 'Manager updated successfully',
      manager: {
        id: manager._id,
        fullName: manager.fullName,
        email: manager.email,
        role: manager.role,
        isActive: manager.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization-wide attendance records (HR only)
 * @route GET /api/hr/attendance
 */
const getAllAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const filter = {};
    if (date) {
      filter.date = date;
    }

    const records = await Attendance.find(filter)
      .populate('employee', 'employeeId department designation')
      .populate('user', 'fullName email')
      .sort({ date: -1, checkIn: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      count: records.length,
      attendance: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization-wide leave requests (HR only)
 * @route GET /api/hr/leaves
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'employeeId department designation')
      .populate('user', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Basic HR summary reports
 * @route GET /api/hr/reports
 */
const getReports = async (req, res, next) => {
  try {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const totalEmployees = await Employee.countDocuments();
    const totalManagers = await User.countDocuments({ role: 'manager' });
    const totalAttendanceRecords = await Attendance.countDocuments();
    const todayPresentCount = await Attendance.countDocuments({ date: today });

    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });
    const totalAnnouncements = await Announcement.countDocuments();

    // Department breakdown
    const departmentAggregation = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const departmentBreakdown = departmentAggregation.map((d) => ({
      department: d._id || 'Unassigned',
      count: d.count
    }));

    res.status(200).json({
      success: true,
      reports: {
        totalEmployees,
        totalManagers,
        totalAttendanceRecords,
        todayPresentCount,
        leaves: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves,
          total: pendingLeaves + approvedLeaves + rejectedLeaves
        },
        totalAnnouncements,
        departmentBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
