const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'General'
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      default: 'Staff Member'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
