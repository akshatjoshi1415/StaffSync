const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

/**
 * Get team members assigned to logged-in manager
 * @route GET /api/manager/team
 */
const getTeamMembers = async (req, res, next) => {
  try {
    const team = await Employee.find({ manager: req.user._id })
      .populate('user', 'fullName email isActive createdAt')
      .sort({ createdAt: -1 });

    // Fetch quick attendance counts for each member
    const teamWithStats = await Promise.all(
      team.map(async (emp) => {
        const totalAttendance = await Attendance.countDocuments({ employee: emp._id });
        const pendingLeaves = await Leave.countDocuments({ employee: emp._id, status: 'Pending' });
        return {
          id: emp._id,
          employeeId: emp.employeeId,
          fullName: emp.user ? emp.user.fullName : 'Unknown',
          email: emp.user ? emp.user.email : '',
          isActive: emp.user ? emp.user.isActive : false,
          department: emp.department,
          designation: emp.designation,
          phone: emp.phone,
          joiningDate: emp.joiningDate,
          totalAttendance,
          pendingLeaves
        };
      })
    );

    res.status(200).json({
      success: true,
      count: teamWithStats.length,
      team: teamWithStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance records for assigned team members
 * @route GET /api/manager/attendance
 */
const getTeamAttendance = async (req, res, next) => {
  try {
    // Find all employees assigned to this manager
    const team = await Employee.find({ manager: req.user._id }).select('_id');
    const teamIds = team.map((t) => t._id);

    if (teamIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        attendance: [],
        message: 'No employees are currently assigned to your team.'
      });
    }

    const attendance = await Attendance.find({ employee: { $in: teamIds } })
      .populate('employee', 'employeeId department designation')
      .populate('user', 'fullName email')
      .sort({ date: -1, checkIn: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get leave requests for assigned team members
 * @route GET /api/manager/leaves
 */
const getTeamLeaves = async (req, res, next) => {
  try {
    const team = await Employee.find({ manager: req.user._id }).select('_id');
    const teamIds = team.map((t) => t._id);

    if (teamIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        leaves: [],
        message: 'No employees are currently assigned to your team.'
      });
    }

    const leaves = await Leave.find({ employee: { $in: teamIds } })
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

module.exports = {
  getTeamMembers,
  getTeamAttendance,
  getTeamLeaves
};
