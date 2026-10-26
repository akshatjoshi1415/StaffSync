# StaffSync — Modern Human Resource Management System
### Academic College Demonstration Project (MERN Stack)

StaffSync is a functional Human Resource Management System (HRMS) built using the **MongoDB, Express.js, React.js, and Node.js (MERN)** technology stack. It is designed specifically as an academic capstone/college project, implementing full end-to-end workflows for employee attendance, leave management, team oversight, and organizational announcements with clean, maintainable code.

---

## 🔑 Demo Accounts & Login Credentials

Ready-to-use demo accounts are seeded directly into the database:

| Role | Email / ID | Password | Portal Dashboard |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin@staffsync.com` | `Admin123!` | `/hr/dashboard` |
| **Department Manager** | `manager@staffsync.com` | `Manager123!` | `/manager/dashboard` |
| **Employee** | `employee@staffsync.com` | `Employee123!` | `/employee/dashboard` |

*(Note: You can re-seed these demo accounts at any time by running `npm run seed:demo`)*

---

## 👥 Core User Roles & Permissions

The application implements three roles enforced strictly at the backend API layer:

| Role | Access & Capabilities |
| :--- | :--- |
| **Employee** | - Mark daily check-in and check-out with automatic duplicate-entry prevention.<br>- View personal attendance history.<br>- Submit leave applications with date validation and track approval status.<br>- Update personal contact details (display name, phone).<br>- Read company announcements and access scheduled team trainings. |
| **Manager** | - View direct reports and assigned team roster.<br>- Monitor team attendance times and working status.<br>- Review, approve, or reject team leave requests with reviewer notes.<br>- Add, edit, and manage training sessions for their department.<br>- Access company-wide announcements. |
| **HR Admin** | - Provision employee user accounts and link employee profiles.<br>- Create and manage department manager accounts.<br>- View company-wide attendance logs with date filtering.<br>- Review, approve, or reject employee leave requests across all departments.<br>- Publish, edit, and delete organization announcements.<br>- Inspect basic operational summary reports (headcount, turnout, leave metrics, department breakdown). |

---

## 🗄️ Database Schema & Relationships

Implemented using Mongoose schemas:

1. **`User`** (`server/models/User.js`):
   - Handles authentication for all three roles (`hr`, `manager`, `employee`).
   - Fields: `fullName`, `email` (unique, lowercase), `password` (salted bcrypt hash), `role`, `isActive`, timestamps.
2. **`Employee`** (`server/models/Employee.js`):
   - Stores employee-specific employment details.
   - Fields: `employeeId` (unique, e.g. `EMP-1001`), `user` (ref: `User`), `department`, `designation`, `phone`, `joiningDate`, `manager` (ref: `User`).
3. **`Attendance`** (`server/models/Attendance.js`):
   - Records daily check-ins and check-outs.
   - Fields: `employee` (ref: `Employee`), `user` (ref: `User`), `date` (`YYYY-MM-DD`), `checkIn` (timestamp), `checkOut` (timestamp), `status` (`Present`, `Late`).
   - Unique compound index on `{ employee: 1, date: 1 }` prevents duplicate daily check-ins.
4. **`Leave`** (`server/models/Leave.js`):
   - Manages time-off applications.
   - Fields: `employee`, `user`, `leaveType` (`Sick`, `Casual`, `Paid`, `Annual`, `Emergency`), `startDate`, `endDate`, `reason`, `status` (`Pending`, `Approved`, `Rejected`), `reviewedBy` (ref: `User`), `reviewComment`, `reviewedAt`.
5. **`Announcement`** (`server/models/Announcement.js`):
   - HR-published broadcast notices.
   - Fields: `title`, `content`, `author` (ref: `User`), timestamps.
6. **`Training`** (`server/models/Training.js`):
   - Professional skill workshops.
   - Fields: `title`, `description`, `schedule`, `department`, `createdBy` (ref: `User`), timestamps.

---

## 💻 Technology Stack

- **Frontend**: React 18, Vite, Bootstrap 5, React Router DOM v6, Redux Toolkit, Axios (configured with `withCredentials: true`), React Icons.
- **Backend**: Node.js, Express.js, MongoDB Atlas / Local MongoDB with Mongoose v8, JWT (HTTP-only cookies & Bearer headers), bcryptjs, express-validator, CORS, dotenv.

---

## 🏃 Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```
*(Installs dependencies across root, server, and client directories)*

### 2. Start Application (Concurrent Mode)
```bash
npm run dev
```
- **Backend API**: `http://localhost:5001`
- **Frontend App**: `http://localhost:5173` (or `http://localhost:5174`)

*(Note for macOS: Port 5001 is configured by default to avoid conflicts with macOS ControlCenter AirPlay Receiver which binds to port 5000).*

---

## 🧪 Automated Testing Suite

StaffSync includes 43 automated backend tests running directly against the database:

```bash
# Run both test suites back-to-back:
npm run test:all

# Run individual suites:
npm run test:auth      # 16 Authentication & RBAC scenarios
npm run test:modules   # 27 Attendance, Leaves, Team & HR scenarios
```

---

## 🎓 Step-by-Step Project Demonstration Guide

Use this simple walkthrough during your presentation or evaluation:

### Step 1: Provision the Initial HR Administrator
Run the protected bootstrap command in your terminal to create your first HR account:
```bash
npm run bootstrap:hr -- --secret="64b5de776e6c30018a47c796a211d055e553449983773170756e191daa38b300" --name="Demo HR Admin" --email="hr@staffsync.test" --password="Password123!"
```

### Step 2: HR Administration Walkthrough
1. Go to `http://localhost:5173/login` and sign in with `hr@staffsync.test` / `Password123!`.
2. Notice automatic redirection to `/hr/dashboard`.
3. Go to **Managers** (`/hr/managers`) &rarr; Click **Add Manager** &rarr; Create `mgr@staffsync.test` ("Department Manager").
4. Go to **Employees** (`/hr/employees`) &rarr; Click **Add Employee** &rarr; Create `emp@staffsync.test` ("Staff Engineer") and assign the newly created manager.
5. Go to **Announcements** (`/hr/announcements`) &rarr; Click **New Announcement** &rarr; Publish a company notice.
6. Check **Reports** (`/hr/reports`) to demonstrate live workforce headcount and department breakdown.
7. Click **Logout**.

### Step 3: Employee Self-Service Walkthrough
1. Log in with `emp@staffsync.test` / `Password123!`.
2. Notice automatic redirection to `/employee/dashboard`.
3. Click **Mark Check-In** to record today's attendance timestamp. Notice the button switches to "Check Out".
4. Go to **Leaves** (`/employee/leaves`) &rarr; Click **Apply for Leave** &rarr; Submit a 3-day Sick Leave request.
5. Go to **Announcements** (`/employee/announcements`) &rarr; View the notice posted by HR.
6. Go to **Profile** (`/employee/profile`) &rarr; Update contact phone number.
7. Click **Logout**.

### Step 4: Manager Approvals Walkthrough
1. Log in with `mgr@staffsync.test` / `Password123!`.
2. Notice automatic redirection to `/manager/dashboard`.
3. View **Direct Reports** (`/manager/team`) showing the assigned employee.
4. Check **Team Attendance** (`/manager/attendance`) to verify the employee's check-in recorded earlier.
5. Go to **Leave Approvals** (`/manager/leaves`) &rarr; Review the pending leave application &rarr; Click **Approve** with a short comment.
6. Go to **Training Management** (`/manager/trainings`) &rarr; Schedule a new technical workshop for the team.
7. Click **Logout**.

---

## 🔒 Security Summary

- **Passworld Hashing**: 12-round salted bcrypt hashing. Plain-text passwords are never stored.
- **Session Protection**: JWTs delivered via secure HTTP-only cookies, shielding against XSS token theft.
- **Backend Authorization**: Every API route enforces `authenticate` and role-check middleware (`authorize('hr')`, `authorize('manager')`, `authorize('employee')`).
- **Team Boundary Enforcement**: Managers can only review and approve leaves for employees assigned to their direct reports.
- **Public Registration Guard**: Public registration is strictly confined to employee accounts. HR and Manager accounts can only be provisioned via HR administration or the bootstrap script.
