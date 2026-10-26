const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { app } = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let server;
let baseUrl;
const testEmailPrefix = `test_${Date.now()}`;

const testEmployee = {
  fullName: 'Test Employee One',
  email: `${testEmailPrefix}_emp@staffsync.test`,
  password: 'Password123!'
};

const testManager = {
  fullName: 'Test Manager One',
  email: `${testEmailPrefix}_mgr@staffsync.test`,
  password: 'Password123!'
};

const testHR = {
  fullName: 'Test HR One',
  email: `${testEmailPrefix}_hr@staffsync.test`,
  password: 'Password123!'
};

const results = [];

const record = (name, passed, details = '') => {
  results.push({ name, passed, details });
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol} - ${name} ${details ? '(' + details + ')' : ''}`);
};

const extractCookie = (response) => {
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) return null;
  const match = setCookie.match(/token=([^;]+)/);
  return match ? `token=${match[1]}` : null;
};

async function runTests() {
  console.log('\n======================================================');
  console.log(' StaffSync Phase 2: Authentication & RBAC Test Suite');
  console.log('======================================================\n');

  try {
    await connectDB();

    // Start HTTP server on dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`[Test Runner] Test server listening on ${baseUrl}\n`);
        resolve();
      });
    });

    let employeeCookie = null;
    let managerCookie = null;
    let hrCookie = null;

    // 1. Health check
    {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = await res.json();
      record('Health Check Endpoint (GET /api/health)', res.status === 200 && body.success === true, `Status ${res.status}`);
    }

    // 2. Register valid employee
    {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEmployee)
      });
      const body = await res.json();
      employeeCookie = extractCookie(res);

      const passed =
        res.status === 201 &&
        body.success === true &&
        body.user.role === 'employee' &&
        !body.user.password &&
        !!employeeCookie;

      record(
        'Scenario 1: Register new employee successfully',
        passed,
        `HTTP ${res.status}, role=${body.user?.role}, passwordExcluded=${!body.user?.password}`
      );
    }

    // 3. Reject invalid email
    {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Invalid Email User',
          email: 'not-an-email',
          password: 'Password123!'
        })
      });
      const body = await res.json();
      record(
        'Scenario 2: Reject invalid email',
        res.status === 400 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 4. Reject weak password (< 8 chars)
    {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Weak Password User',
          email: `${testEmailPrefix}_weak@staffsync.test`,
          password: 'short'
        })
      });
      const body = await res.json();
      record(
        'Scenario 3: Reject weak password (< 8 chars)',
        res.status === 400 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 5. Reject duplicate email registration
    {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEmployee)
      });
      const body = await res.json();
      record(
        'Scenario 4: Reject duplicate email registration',
        res.status === 409 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 6. Reject registration attempts that request the HR or manager role
    {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Privilege Escalation Attempt',
          email: `${testEmailPrefix}_hacker@staffsync.test`,
          password: 'Password123!',
          role: 'hr'
        })
      });
      const body = await res.json();
      record(
        'Scenario 5: Reject registration attempts requesting privileged role',
        res.status === 400 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 7. Log in with valid credentials
    {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmployee.email,
          password: testEmployee.password
        })
      });
      const body = await res.json();
      employeeCookie = extractCookie(res);
      record(
        'Scenario 6: Log in with valid credentials',
        res.status === 200 && body.success === true && !!employeeCookie,
        `HTTP ${res.status}, role=${body.user?.role}`
      );
    }

    // 8. Reject incorrect credentials (wrong password)
    {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmployee.email,
          password: 'WrongPassword999!'
        })
      });
      const body = await res.json();
      record(
        'Scenario 7: Reject incorrect credentials with generic message',
        res.status === 401 && body.success === false && body.message === 'Invalid email or password.',
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 9. Reject inactive accounts
    {
      const deactivatedUser = new User({
        fullName: 'Inactive User',
        email: `${testEmailPrefix}_inactive@staffsync.test`,
        password: 'Password123!',
        role: 'employee',
        isActive: false
      });
      await deactivatedUser.save();

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: deactivatedUser.email,
          password: 'Password123!'
        })
      });
      const body = await res.json();
      record(
        'Scenario 8: Reject inactive accounts during login',
        res.status === 403 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 10. Access current-user endpoint (GET /api/auth/me) with valid authentication
    {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Cookie: employeeCookie }
      });
      const body = await res.json();
      record(
        'Scenario 9: Access /api/auth/me with valid authentication',
        res.status === 200 && body.success === true && body.user.email === testEmployee.email.toLowerCase(),
        `HTTP ${res.status}, email=${body.user?.email}`
      );
    }

    // 11. Reject requests without authentication
    {
      const res = await fetch(`${baseUrl}/api/auth/me`);
      const body = await res.json();
      record(
        'Scenario 10: Reject requests without authentication',
        res.status === 401 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 12. Reject expired or invalid JWTs
    {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Cookie: 'token=invalid.jwt.token.string' }
      });
      const body = await res.json();
      record(
        'Scenario 11: Reject expired or invalid JWTs',
        res.status === 401 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // Create Manager and HR users in DB to test RBAC routes
    {
      const mgr = new User({
        fullName: testManager.fullName,
        email: testManager.email,
        password: testManager.password,
        role: 'manager',
        isActive: true
      });
      await mgr.save();

      const hr = new User({
        fullName: testHR.fullName,
        email: testHR.email,
        password: testHR.password,
        role: 'hr',
        isActive: true
      });
      await hr.save();

      // Log in manager
      const mgrRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testManager.email, password: testManager.password })
      });
      managerCookie = extractCookie(mgrRes);

      // Log in HR
      const hrRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testHR.email, password: testHR.password })
      });
      hrCookie = extractCookie(hrRes);
    }

    // 13. Allow an HR user to access HR-only routes (GET /api/hr)
    {
      const res = await fetch(`${baseUrl}/api/hr`, {
        headers: { Cookie: hrCookie }
      });
      const body = await res.json();
      record(
        'Scenario 12: Allow HR user to access HR-only routes (GET /api/hr)',
        res.status === 200 && body.success === true,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 14. Prevent employees from accessing HR-only routes (GET /api/hr)
    {
      const res = await fetch(`${baseUrl}/api/hr`, {
        headers: { Cookie: employeeCookie }
      });
      const body = await res.json();
      record(
        'Scenario 13: Prevent employees from accessing HR-only routes',
        res.status === 403 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 15. Prevent managers from accessing employee-only routes (GET /api/employee)
    {
      const res = await fetch(`${baseUrl}/api/employee`, {
        headers: { Cookie: managerCookie }
      });
      const body = await res.json();
      record(
        'Scenario 14: Prevent managers from accessing employee-only routes',
        res.status === 403 && body.success === false,
        `HTTP ${res.status}: ${body.message}`
      );
    }

    // 16. Verify logout behavior (POST /api/auth/logout)
    {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { Cookie: employeeCookie }
      });
      const body = await res.json();
      const setCookie = res.headers.get('set-cookie');
      const cleared = setCookie && (setCookie.includes('token=;') || setCookie.includes('Expires=Thu, 01 Jan 1970'));

      record(
        'Scenario 15: Verify logout clears authentication cookie',
        res.status === 200 && body.success === true && cleared,
        `HTTP ${res.status}, cleared=${!!cleared}`
      );
    }

    // Clean up test records created during this run
    await User.deleteMany({ email: { $regex: new RegExp(`^${testEmailPrefix}`) } });
    console.log('\n[Test Runner] Cleaned up temporary test database records.');

    // Print summary
    const allPassed = results.every((r) => r.passed);
    console.log('\n======================================================');
    console.log(` Test Summary: ${results.filter((r) => r.passed).length}/${results.length} Scenarios Passed`);
    console.log(` Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    console.log('======================================================\n');

    server.close();
    await mongoose.connection.close();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n[Test Fatal Error]:', error);
    if (server) server.close();
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
