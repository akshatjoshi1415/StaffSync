const Employee = require('../models/Employee');

/**
 * Generate a unique employee ID that does not collide with existing records.
 * Format: EMP-XXXX (e.g. EMP-5284)
 *
 * @returns {Promise<string>}
 */
const generateUniqueEmployeeId = async () => {
  let employeeId = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 20) {
    attempts++;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    employeeId = `EMP-${randomDigits}`;
    const found = await Employee.findOne({ employeeId });
    if (!found) {
      exists = false;
    }
  }

  // Fallback using timestamp if 20 attempts collide
  if (exists) {
    employeeId = `EMP-${Date.now().toString().slice(-4)}`;
  }

  return employeeId;
};

module.exports = generateUniqueEmployeeId;
