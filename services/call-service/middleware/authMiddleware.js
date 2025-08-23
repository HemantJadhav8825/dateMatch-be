const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || req.headers.Authorization || '';
  const token = authorization.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // now you have uid: payload.uid
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
