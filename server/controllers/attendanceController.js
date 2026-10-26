const Attendance = require('../models/Attendance');
const { getOrCreateEmployee } = require('./employeeController');

// Helper to get formatted local date string 'YYYY-MM-DD'
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Mark Attendance Check-In
 * @route POST /api/attendance/check-in
 */
const checkIn = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployee(req.user);
    const today = getTodayDateString();

    // Check if attendance already exists for today
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today.'
      });
    }

    const checkInTime = new Date();
    // Simple status calculation: after 9:30 AM is considered Late
    const hour = checkInTime.getHours();
    const minutes = checkInTime.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minutes > 30);

    const attendance = await Attendance.create({
      employee: employee._id,
      user: req.user._id,
      date: today,
      checkIn: checkInTime,
      status: isLate ? 'Late' : 'Present'
    });

    res.status(201).json({
      success: true,
      message: 'Check-in successful',
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today.'
      });
    }
    next(error);
  }
};

/**
 * Mark Attendance Check-Out
 * @route POST /api/attendance/check-out
 */
const checkOut = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployee(req.user);
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in found for today. Please check in first.'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.'
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Check-out successful',
      attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Today's Attendance Status
 * @route GET /api/attendance/today
 */
const getTodayAttendance = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployee(req.user);
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    res.status(200).json({
      success: true,
      attendance: attendance || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Personal Attendance History
 * @route GET /api/attendance/my
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await getOrCreateEmployee(req.user);

    const history = await Attendance.find({ employee: employee._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(60);

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance
};
