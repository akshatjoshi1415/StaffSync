const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');

const seedDemoUsers = async () => {
  try {
    await connectDB();

    console.log('Seeding demo accounts for StaffSync...');

    // 1. HR Administrator
    let hr = await User.findOne({ email: 'admin@staffsync.com' });
    if (!hr) {
      hr = new User({
        fullName: 'Sarah Jenkins (HR Admin)',
        email: 'admin@staffsync.com',
        password: 'Admin123!',
        role: 'hr',
        isActive: true
      });
      await hr.save();
      console.log('Created HR Admin: admin@staffsync.com / Admin123!');
    }

    // 2. Department Manager
    let manager = await User.findOne({ email: 'manager@staffsync.com' });
    if (!manager) {
      manager = new User({
        fullName: 'Alex Vance (Tech Lead)',
        email: 'manager@staffsync.com',
        password: 'Manager123!',
        role: 'manager',
        isActive: true
      });
      await manager.save();
      console.log('Created Manager: manager@staffsync.com / Manager123!');
    }

    // 3. Employee
    let employeeUser = await User.findOne({ email: 'employee@staffsync.com' });
    if (!employeeUser) {
      employeeUser = new User({
        fullName: 'John Doe (Software Engineer)',
        email: 'employee@staffsync.com',
        password: 'Employee123!',
        role: 'employee',
        isActive: true
      });
      await employeeUser.save();
      console.log('Created Employee: employee@staffsync.com / Employee123!');
    }

    // 4. Linked Employee Profile
    let empProfile = await Employee.findOne({ user: employeeUser._id });
    if (!empProfile) {
      empProfile = await Employee.create({
        employeeId: 'EMP-1001',
        user: employeeUser._id,
        department: 'Engineering',
        designation: 'Full Stack Developer',
        phone: '+1 555-0142',
        joiningDate: new Date('2025-01-15'),
        manager: manager._id
      });
      console.log('Created Employee Profile: EMP-1001 linked to Alex Vance');
    }

    // 5. Sample Announcement
    const existingAnnounce = await Announcement.findOne({ title: 'Welcome to StaffSync HRMS' });
    if (!existingAnnounce) {
      await Announcement.create({
        title: 'Welcome to StaffSync HRMS',
        content: 'Welcome to the StaffSync Modern Human Resource Management System. Employees can mark attendance, submit leave requests, and browse scheduled technical workshops.',
        author: hr._id
      });
      console.log('Created sample announcement.');
    }

    // 6. Sample Training Workshop
    const existingTraining = await Training.findOne({ title: 'Full Stack MERN Architecture & Deployment' });
    if (!existingTraining) {
      await Training.create({
        title: 'Full Stack MERN Architecture & Deployment',
        description: 'Hands-on technical workshop covering React state management, REST API validation, and MongoDB indexing best practices.',
        schedule: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        department: 'Engineering',
        createdBy: manager._id
      });
      console.log('Created sample training program.');
    }

    console.log('\nDemo accounts ready!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo accounts:', error.message);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
};

seedDemoUsers();
