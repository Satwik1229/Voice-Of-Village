const verifyToken = require('./authMiddleware');

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'sarpanch')) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admin/Sarpanch only.' });
    }
  });
};

module.exports = verifyAdmin;
