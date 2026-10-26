const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { getOrCreateEmployee } = require('./employeeController');

/**
 * Apply for Leave (Employee)
 * @route POST /api/leaves
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start date, end date, and reason for the leave.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start or end date format.'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.'
      });
    }

    const employee = await getOrCreateEmployee(req.user);

    const leave = await Leave.create({
      employee: employee._id,
      user: req.user._id,
      leaveType: leaveType || 'Casual Leave',
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Personal Leaves (Employee)
 * @route GET /api/leaves/my
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployee(req.user);

    const leaves = await Leave.find({ employee: employee._id })
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
 * Update Leave Status (Manager or HR)
 * @route PUT /api/leaves/:id/status
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected.'
      });
    }

    const leave = await Leave.findById(id).populate('employee');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.'
      });
    }

    // Role check: If caller is a Manager, verify this employee reports to them
    if (req.user.role === 'manager') {
      const isAssigned =
        leave.employee &&
        leave.employee.manager &&
        leave.employee.manager.toString() === req.user._id.toString();

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only review leaves for employees assigned to your team.'
        });
      }
    }

    // Employees cannot review their own leaves
    if (leave.user.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot approve or reject your own leave request.'
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComment = reviewComment ? reviewComment.trim() : `Decision by ${req.user.fullName}`;
    leave.reviewedAt = new Date();

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee')
      .populate('user', 'fullName email')
      .populate('reviewedBy', 'fullName email');

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave: populatedLeave
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  updateLeaveStatus
};
