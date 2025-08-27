const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'missing_token' });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Attach decoded payload (e.g., { uid: '123', iat, exp })
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
};
