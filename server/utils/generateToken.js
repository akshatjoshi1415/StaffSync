const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user.
 *
 * @param {string} userId - User ID to encode in token payload
 * @param {string} role - User role
 * @returns {string} - Signed JWT
 */
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
};

/**
 * Standard cookie configuration options for JWT session cookies.
 * Configured securely for development and production environments.
 *
 * @returns {import('express').CookieOptions}
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  };
};

module.exports = {
  generateToken,
  getCookieOptions
};
