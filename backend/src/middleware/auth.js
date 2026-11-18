const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'civicpulse_fallback_secret';

/**
 * Verifies JWT and attaches user to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Restricts to admin/supervisor roles
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'supervisor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

/**
 * Optional auth — attaches user if token present, doesn't block
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.substring(7), SECRET);
    } catch (_) { /* ignore */ }
  }
  next();
};

module.exports = { authenticate, requireAdmin, optionalAuth };
