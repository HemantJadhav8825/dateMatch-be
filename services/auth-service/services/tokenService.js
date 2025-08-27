const jwt = require('jsonwebtoken');
require('dotenv').config();

function signAccess(payload, secret, opts = {}) {
  return jwt.sign(payload, secret, {
    expiresIn: process.env.ACCESS_TTL || '15m',
    issuer: process.env.ISSUER || 'voice-first',
    ...opts
  });
}

function signRefresh(payload, secret, opts = {}) {
  return jwt.sign({ ...payload, rt: true }, secret, {
    expiresIn: process.env.REFRESH_TTL || '30d',
    issuer: process.env.ISSUER || 'voice-first',
    ...opts
  });
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret, { issuer: process.env.ISSUER || 'voice-first' });
}

module.exports = { signAccess, signRefresh, verifyToken };
