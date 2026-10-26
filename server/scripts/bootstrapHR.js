const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

/**
 * Bootstrap the initial HR Administrator.
 *
 * Usage:
 *   node scripts/bootstrapHR.js --secret=<BOOTSTRAP_SECRET> --email=<EMAIL> --name="<FULL_NAME>" --password="<PASSWORD>"
 *
 * Environment fallback:
 *   BOOTSTRAP_SECRET, HR_ADMIN_EMAIL, HR_ADMIN_NAME, HR_ADMIN_PASSWORD
 */
const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, ...values] = arg.slice(2).split('=');
      args[key] = values.join('=');
    }
  });
  return args;
};

const bootstrapHR = async () => {
  const args = parseArgs();
  const secretProvided = args.secret || process.env.BOOTSTRAP_SECRET_INPUT;
  const email = (args.email || process.env.HR_ADMIN_EMAIL || '').toLowerCase().trim();
  const fullName = (args.name || process.env.HR_ADMIN_NAME || '').trim();
  const password = args.password || process.env.HR_ADMIN_PASSWORD;

  console.log('\n========================================');
  console.log(' StaffSync HR Administrator Bootstrap');
  console.log('========================================\n');

  // 1. Verify environment secret exists
  const envSecret = process.env.BOOTSTRAP_SECRET;
  if (!envSecret || envSecret.trim() === '' || envSecret === 'your_bootstrap_admin_secret_here') {
    console.error('[Error] BOOTSTRAP_SECRET is not configured properly in server/.env.');
    console.error('Please configure a strong random BOOTSTRAP_SECRET before running this script.');
    process.exit(1);
  }

  // 2. Validate provided setup secret
  if (!secretProvided || secretProvided !== envSecret) {
    console.error('[Error] Invalid or missing bootstrap secret. Execution aborted.');
    console.error('Provide the secret via --secret=<secret>');
    process.exit(1);
  }

  // 3. Validate user fields
  if (!fullName || !email || !password) {
    console.error('[Error] Missing required HR administrator credentials.');
    console.error('Usage: node scripts/bootstrapHR.js --secret=<secret> --email=<email> --name="<name>" --password="<password>"');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[Error] Password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    // 4. Connect to database
    await connectDB();

    // 5. Guard against multiple bootstrap runs: refuse if an HR account already exists
    const existingHR = await User.findOne({ role: 'hr' });
    if (existingHR) {
      console.error('\n[Security Notice] An HR Administrator account already exists in this system.');
      console.error('For security reasons, the initial bootstrap procedure can only be executed once.');
      console.error('Additional accounts must be provisioned through authorized administrative workflows.\n');
      await mongoose.connection.close();
      process.exit(1);
    }

    // 6. Check if an account with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`\n[Error] An account with email '${email}' already exists. Choose a different email.\n`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // 7. Create initial HR user
    const hrUser = new User({
      fullName,
      email,
      password,
      role: 'hr',
      isActive: true
    });

    await hrUser.save();

    console.log('\n[Success] Initial HR Administrator created successfully!');
    console.log(`  Name:  ${hrUser.fullName}`);
    console.log(`  Email: ${hrUser.email}`);
    console.log(`  Role:  ${hrUser.role}`);
    console.log('\nImportant next steps:');
    console.log('1. You can now log in at http://localhost:5173/login with these credentials.');
    console.log('2. For enhanced security, remove or comment out BOOTSTRAP_SECRET from server/.env.');
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n[Fatal Error during bootstrap]:', error.message);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
};

bootstrapHR();
