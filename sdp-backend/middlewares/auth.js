const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Please authenticate' });
    }
  };
};

module.exports = auth;