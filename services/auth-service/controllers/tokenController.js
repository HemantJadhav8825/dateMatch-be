const dayjs = require('dayjs');
const RefreshToken = require('../models/RefreshToken');
const { verifyToken, signAccess, signRefresh } = require('../services/tokenService');

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ error: 'missing_refresh' });

    const payload = verifyToken(refreshToken, process.env.JWT_SECRET);
    if (!payload.rt) return res.status(401).json({ error: 'not_refresh' });

    const dbToken = await RefreshToken.findOne({ token: refreshToken, userId: payload.uid });
    if (!dbToken || dbToken.revokedAt) return res.status(401).json({ error: 'revoked_or_unknown' });
    if (dbToken.expiresAt < new Date()) return res.status(401).json({ error: 'expired' });

    dbToken.revokedAt = new Date();
    await dbToken.save();

    const newAccess = signAccess({ uid: payload.uid }, process.env.JWT_SECRET);
    const newRefresh = signRefresh({ uid: payload.uid }, process.env.JWT_SECRET);
    const newExp = dayjs().add(
      Number((process.env.REFRESH_TTL || '30d').replace('d', '')) || 30,
      'day'
    ).toDate();

    await RefreshToken.create({
      userId: payload.uid,
      token: newRefresh,
      expiresAt: newExp,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'invalid_refresh' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'missing_refresh' });

  try {
    const payload = verifyToken(refreshToken, process.env.JWT_SECRET);
    const dbToken = await RefreshToken.findOne({ token: refreshToken, userId: payload.uid });
    if (dbToken && !dbToken.revokedAt) {
      dbToken.revokedAt = new Date();
      await dbToken.save();
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
};
