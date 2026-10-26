const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    date: {
      type: String,
      required: [true, 'Attendance date string is required (YYYY-MM-DD)'],
      trim: true
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required']
    },
    checkOut: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-day'],
      default: 'Present'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate attendance records for the same employee on the same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
