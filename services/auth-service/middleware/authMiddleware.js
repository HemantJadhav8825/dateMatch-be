const { verifyToken } = require('../services/tokenService');

exports.authMiddleware = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  try {
    req.user = verifyToken(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
};
