const jwt = require('jsonwebtoken');

function authMiddleware(roles = [], departments = []) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied: role' });
      }
      if (departments.length && user.role === 'staff' && !departments.includes(user.department)) {
        return res.status(403).json({ message: 'Access denied: department' });
      }
      req.user = user;
      next();
    });
  };
}

module.exports = authMiddleware;
