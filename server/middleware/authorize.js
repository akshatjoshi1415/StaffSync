/**
 * Middleware factory to authorize access based on user role.
 *
 * @param  {...string} allowedRoles - Permitted roles (e.g. 'hr', 'manager', 'employee')
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization check.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
};

module.exports = authorize;
