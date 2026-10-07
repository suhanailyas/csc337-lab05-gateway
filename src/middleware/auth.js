const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(h.slice(7), process.env.JWT_ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.checkRole = (roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: 'Forbidden: insufficient role' });