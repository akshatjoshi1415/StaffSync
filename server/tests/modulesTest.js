const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { app } = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');

let server;
let baseUrl;
const testRun = `mod_${Date.now()}`;

const results = [];
const record = (name, passed, details = '') => {
  results.push({ name, passed, details });
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol} - ${name} ${details ? '(' + details + ')' : ''}`);
};

const extractCookie = (res) => {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return null;
  const match = setCookie.match(/token=([^;]+)/);
  return match ? `token=${match[1]}` : null;
};

async function runModuleTests() {
  console.log('\n======================================================');
  console.log(' StaffSync College Project Requirements Test Suite');
  console.log('======================================================\n');

  try {
    await connectDB();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`[Test Runner] Server listening on ${baseUrl}\n`);
        resolve();
      });
    });

    // 1. Create Test HR, Manager, and Employee
    const hrUser = new User({
      fullName: 'HR Officer',
      email: `${testRun}_hr@staffsync.test`,
      password: 'Password123!',
      role: 'hr'
    });
    await hrUser.save();

    const managerUser = new User({
      fullName: 'Team Manager',
      email: `${testRun}_mgr@staffsync.test`,
      password: 'Password123!',
      role: 'manager'
    });
    await managerUser.save();

    const otherManager = new User({
      fullName: 'Other Manager',
      email: `${testRun}_other_mgr@staffsync.test`,
      password: 'Password123!',
      role: 'manager'
    });
    await otherManager.save();

    const empUser = new User({
      fullName: 'Staff Member',
      email: `${testRun}_emp@staffsync.test`,
      password: 'Password123!',
      role: 'employee'
    });
    await empUser.save();

    // Link Employee to Manager
    const employeeRecord = await Employee.create({
      employeeId: `EMP-${Date.now().toString().slice(-4)}`,
      user: empUser._id,
      department: 'Engineering',
      designation: 'Junior Developer',
      phone: '123-456-7890',
      manager: managerUser._id
    });

    // Helper to log in and get cookie
    const getSession = async (email, password = 'Password123!') => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return extractCookie(res);
    };

    const hrCookie = await getSession(hrUser.email);
    const mgrCookie = await getSession(managerUser.email);
    const otherMgrCookie = await getSession(otherManager.email);
    const empCookie = await getSession(empUser.email);

    // --- TEST EMPLOYEE PROFILE ---
    {
      const res = await fetch(`${baseUrl}/api/employee/profile`, {
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '1. Employee Profile Retrieval (GET /api/employee/profile)',
        res.status === 200 && data.profile.department === 'Engineering' && data.profile.manager.email === managerUser.email,
        `Status ${res.status}, Dept: ${data.profile?.department}`
      );
    }

    {
      const res = await fetch(`${baseUrl}/api/employee/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: empCookie },
        body: JSON.stringify({ fullName: 'Staff Member Updated', phone: '999-888-7777' })
      });
      const data = await res.json();
      record(
        '2. Employee Profile Update (PUT /api/employee/profile)',
        res.status === 200 && data.profile.phone === '999-888-7777' && data.profile.fullName === 'Staff Member Updated',
        `Phone updated: ${data.profile?.phone}`
      );
    }

    // --- TEST ATTENDANCE WORKFLOW ---
    {
      const res = await fetch(`${baseUrl}/api/attendance/check-in`, {
        method: 'POST',
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '3. Attendance Check-In (POST /api/attendance/check-in)',
        res.status === 201 && data.success === true && !!data.attendance.checkIn,
        `Check-in recorded at ${data.attendance?.checkIn}`
      );
    }

    {
      // Duplicate check-in on the same day must be rejected
      const res = await fetch(`${baseUrl}/api/attendance/check-in`, {
        method: 'POST',
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '4. Duplicate Daily Check-In Rejected',
        res.status === 400 && data.success === false,
        `HTTP ${res.status}: ${data.message}`
      );
    }

    {
      const res = await fetch(`${baseUrl}/api/attendance/today`, {
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '5. Get Today Attendance Status (GET /api/attendance/today)',
        res.status === 200 && !!data.attendance && !data.attendance.checkOut,
        `Status ${res.status}, checkedOut=${!!data.attendance?.checkOut}`
      );
    }

    {
      const res = await fetch(`${baseUrl}/api/attendance/check-out`, {
        method: 'POST',
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '6. Attendance Check-Out (POST /api/attendance/check-out)',
        res.status === 200 && data.success === true && !!data.attendance.checkOut,
        `Check-out recorded at ${data.attendance?.checkOut}`
      );
    }

    {
      const res = await fetch(`${baseUrl}/api/attendance/my`, {
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '7. Personal Attendance History (GET /api/attendance/my)',
        res.status === 200 && data.count >= 1,
        `Records returned: ${data.count}`
      );
    }

    // --- TEST LEAVE WORKFLOW ---
    let createdLeaveId = null;
    {
      // Invalid date rejection (end before start)
      const res = await fetch(`${baseUrl}/api/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: empCookie },
        body: JSON.stringify({
          leaveType: 'Sick Leave',
          startDate: '2026-11-10',
          endDate: '2026-11-05',
          reason: 'Fever'
        })
      });
      const data = await res.json();
      record(
        '8. Leave Rejection: End Date Before Start Date',
        res.status === 400 && data.success === false,
        `HTTP ${res.status}: ${data.message}`
      );
    }

    {
      // Valid leave request
      const res = await fetch(`${baseUrl}/api/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: empCookie },
        body: JSON.stringify({
          leaveType: 'Sick Leave',
          startDate: '2026-11-01',
          endDate: '2026-11-03',
          reason: 'Medical recovery'
        })
      });
      const data = await res.json();
      createdLeaveId = data.leave?._id;
      record(
        '9. Employee Submits Leave Request (POST /api/leaves)',
        res.status === 201 && data.leave.status === 'Pending',
        `Leave ID: ${createdLeaveId}, Status: ${data.leave?.status}`
      );
    }

    {
      // Employee views own leaves
      const res = await fetch(`${baseUrl}/api/leaves/my`, {
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '10. Employee Views Leave Status (GET /api/leaves/my)',
        res.status === 200 && data.count >= 1 && data.leaves[0].status === 'Pending',
        `Count: ${data.count}, Status: ${data.leaves?.[0]?.status}`
      );
    }

    {
      // Unauthorized manager cannot approve other manager's team leaves
      const res = await fetch(`${baseUrl}/api/leaves/${createdLeaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: otherMgrCookie },
        body: JSON.stringify({ status: 'Approved', reviewComment: 'Denied team check' })
      });
      const data = await res.json();
      record(
        '11. Unassigned Manager Cannot Approve Leave (403 Forbidden)',
        res.status === 403 && data.success === false,
        `HTTP ${res.status}: ${data.message}`
      );
    }

    {
      // Assigned manager approves leave
      const res = await fetch(`${baseUrl}/api/leaves/${createdLeaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: mgrCookie },
        body: JSON.stringify({ status: 'Approved', reviewComment: 'Approved for medical recovery' })
      });
      const data = await res.json();
      record(
        '12. Assigned Manager Approves Team Leave (PUT /api/leaves/:id/status)',
        res.status === 200 && data.leave.status === 'Approved',
        `Status: ${data.leave?.status}, Reviewer: ${data.leave?.reviewedBy?.fullName}`
      );
    }

    // --- TEST MANAGER MODULE ---
    {
      const res = await fetch(`${baseUrl}/api/manager/team`, {
        headers: { Cookie: mgrCookie }
      });
      const data = await res.json();
      record(
        '13. Manager Views Assigned Team Members (GET /api/manager/team)',
        res.status === 200 && data.count >= 1 && data.team[0].email === empUser.email,
        `Team count: ${data.count}`
      );
    }

    {
      const res = await fetch(`${baseUrl}/api/manager/attendance`, {
        headers: { Cookie: mgrCookie }
      });
      const data = await res.json();
      record(
        '14. Manager Views Team Attendance (GET /api/manager/attendance)',
        res.status === 200 && data.count >= 1,
        `Records count: ${data.count}`
      );
    }

    {
      const res = await fetch(`${baseUrl}/api/manager/leaves`, {
        headers: { Cookie: mgrCookie }
      });
      const data = await res.json();
      record(
        '15. Manager Views Team Leaves (GET /api/manager/leaves)',
        res.status === 200 && data.count >= 1,
        `Leaves count: ${data.count}`
      );
    }

    // --- TEST ANNOUNCEMENTS ---
    let announcementId = null;
    {
      // Non-HR cannot create announcement
      const res = await fetch(`${baseUrl}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: empCookie },
        body: JSON.stringify({ title: 'Hack', content: 'Unauthorized' })
      });
      record(
        '16. Employee Cannot Create Announcements (403 Forbidden)',
        res.status === 403,
        `Status ${res.status}`
      );
    }

    {
      // HR creates announcement
      const res = await fetch(`${baseUrl}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: hrCookie },
        body: JSON.stringify({ title: 'Company Town Hall', content: 'Quarterly Town Hall at 3 PM Friday.' })
      });
      const data = await res.json();
      announcementId = data.announcement?._id;
      record(
        '17. HR Creates Announcement (POST /api/announcements)',
        res.status === 201 && data.announcement.title === 'Company Town Hall',
        `Title: ${data.announcement?.title}`
      );
    }

    {
      // Employee views announcements
      const res = await fetch(`${baseUrl}/api/announcements`, {
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '18. Employee Views Announcements (GET /api/announcements)',
        res.status === 200 && data.count >= 1,
        `Count: ${data.count}`
      );
    }

    // --- TEST TRAINING PROGRAMS ---
    let trainingId = null;
    {
      // Manager creates training program
      const res = await fetch(`${baseUrl}/api/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: mgrCookie },
        body: JSON.stringify({
          title: 'Git & GitHub Best Practices',
          description: 'Team workshop on feature branching and code reviews.',
          schedule: '2026-11-15T10:00:00Z',
          department: 'Engineering'
        })
      });
      const data = await res.json();
      trainingId = data.training?._id;
      record(
        '19. Manager Creates Training Program (POST /api/trainings)',
        res.status === 201 && data.training.title === 'Git & GitHub Best Practices',
        `Title: ${data.training?.title}`
      );
    }

    {
      // Employee views training programs
      const res = await fetch(`${baseUrl}/api/trainings`, {
        headers: { Cookie: empCookie }
      });
      const data = await res.json();
      record(
        '20. Employee Views Available Trainings (GET /api/trainings)',
        res.status === 200 && data.count >= 1,
        `Count: ${data.count}`
      );
    }

    // --- TEST HR MODULE ---
    {
      // HR creates manager account
      const res = await fetch(`${baseUrl}/api/hr/managers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: hrCookie },
        body: JSON.stringify({
          fullName: 'New Sales Manager',
          email: `${testRun}_sales_mgr@staffsync.test`,
          password: 'Password123!'
        })
      });
      const data = await res.json();
      record(
        '21. HR Creates Manager Account (POST /api/hr/managers)',
        res.status === 201 && data.manager.role === 'manager',
        `Created manager: ${data.manager?.email}`
      );
    }

    {
      // HR creates employee account + profile
      const res = await fetch(`${baseUrl}/api/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: hrCookie },
        body: JSON.stringify({
          fullName: 'New Sales Associate',
          email: `${testRun}_sales_rep@staffsync.test`,
          password: 'Password123!',
          department: 'Sales',
          designation: 'Associate',
          phone: '555-1234',
          managerId: managerUser._id
        })
      });
      const data = await res.json();
      record(
        '22. HR Creates Employee Account & Profile (POST /api/hr/employees)',
        res.status === 201 && data.employee.department === 'Sales' && !!data.employee.employeeId,
        `Emp ID: ${data.employee?.employeeId}`
      );
    }

    {
      // HR views all employees
      const res = await fetch(`${baseUrl}/api/hr/employees`, {
        headers: { Cookie: hrCookie }
      });
      const data = await res.json();
      record(
        '23. HR Views All Employees (GET /api/hr/employees)',
        res.status === 200 && data.count >= 2,
        `Total employees: ${data.count}`
      );
    }

    {
      // HR views all managers
      const res = await fetch(`${baseUrl}/api/hr/managers`, {
        headers: { Cookie: hrCookie }
      });
      const data = await res.json();
      record(
        '24. HR Views All Managers (GET /api/hr/managers)',
        res.status === 200 && data.count >= 2,
        `Total managers: ${data.count}`
      );
    }

    {
      // HR views organization attendance
      const res = await fetch(`${baseUrl}/api/hr/attendance`, {
        headers: { Cookie: hrCookie }
      });
      const data = await res.json();
      record(
        '25. HR Views Organization Attendance (GET /api/hr/attendance)',
        res.status === 200 && data.count >= 1,
        `Total records: ${data.count}`
      );
    }

    {
      // HR views organization leaves
      const res = await fetch(`${baseUrl}/api/hr/leaves`, {
        headers: { Cookie: hrCookie }
      });
      const data = await res.json();
      record(
        '26. HR Views Organization Leaves (GET /api/hr/leaves)',
        res.status === 200 && data.count >= 1,
        `Total leaves: ${data.count}`
      );
    }

    {
      // HR views summary reports
      const res = await fetch(`${baseUrl}/api/hr/reports`, {
        headers: { Cookie: hrCookie }
      });
      const data = await res.json();
      record(
        '27. HR Basic Summary Reports (GET /api/hr/reports)',
        res.status === 200 && data.reports.totalEmployees >= 1 && data.reports.leaves.approved >= 1,
        `Employees: ${data.reports?.totalEmployees}, Approved Leaves: ${data.reports?.leaves?.approved}`
      );
    }

    // --- CLEANUP TEST DATABASE RECORDS ---
    const userIds = [hrUser._id, managerUser._id, otherManager._id, empUser._id];
    await User.deleteMany({ email: { $regex: new RegExp(`^${testRun}`) } });
    await Employee.deleteMany({ user: { $in: userIds } });
    await Attendance.deleteMany({ user: { $in: userIds } });
    await Leave.deleteMany({ user: { $in: userIds } });
    if (announcementId) await Announcement.findByIdAndDelete(announcementId);
    if (trainingId) await Training.findByIdAndDelete(trainingId);

    console.log('\n[Test Runner] Cleaned up temporary test database records.');

    const allPassed = results.every((r) => r.passed);
    console.log('\n======================================================');
    console.log(` Test Summary: ${results.filter((r) => r.passed).length}/${results.length} Scenarios Passed`);
    console.log(` Overall Result: ${allPassed ? 'ALL MODULE TESTS PASSED' : 'SOME TESTS FAILED'}`);
    console.log('======================================================\n');

    server.close();
    await mongoose.connection.close();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n[Fatal Error]:', error);
    if (server) server.close();
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
}

runModuleTests();
