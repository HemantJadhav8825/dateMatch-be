const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const { v4: uuid } = require('uuid');
require('dotenv').config();

const User = require('./models/User');
const Otp = require('./models/Otp');
const RefreshToken = require('./models/RefreshToken');
const { smsSender } = require('./sms');
const { signAccess, signRefresh, verifyToken } = require('./jwt');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const otpLimiter = rateLimit({
  windowMs: Number(process.env.OTP_WINDOW_MS || 60_000),
  max: Number(process.env.OTP_MAX_PER_WINDOW || 10),
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Auth Mongo connected');
});

const sendSMS = smsSender(process.env);

app.get('/health', (_req, res) => res.json({ ok: true }));

// --- OTP: start ---
app.post('/otp/start', otpLimiter, async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const code = process.env.OTP_STRATEGY === 'dev'
      ? '1234'
      : String(Math.floor(100000 + Math.random() * 900000));

    const requestId = uuid();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = dayjs().add(5, 'minute').toDate();

    await Otp.deleteMany({ phone }); // one active OTP per phone
    await Otp.create({ phone, requestId, codeHash, expiresAt });

    await sendSMS(phone, `Your verification code is ${code}. It expires in 5 minutes.`);

    res.json({ requestId, ttl: 300 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'otp_start_failed' });
  }
});

// --- OTP: verify -> issue tokens ---
app.post('/otp/verify', otpLimiter, async (req, res) => {
  try {
    const { phone, requestId, code } = req.body || {};
    if (!phone || !requestId || !code) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    const rec = await Otp.findOne({ phone, requestId });
    if (!rec) return res.status(400).json({ error: 'invalid_request' });
    if (rec.expiresAt < new Date()) return res.status(400).json({ error: 'expired' });

    const ok = await bcrypt.compare(code, rec.codeHash);
    if (!ok) {
      rec.tries += 1;
      await rec.save();
      return res.status(400).json({ error: 'invalid_code' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        subscription: { tier: 'free', expiresAt: null },
        limits: { dailyCalls: 0, lastReset: null },
      });
    }

    await Otp.deleteMany({ phone });

    // Create tokens
    const accessToken = signAccess({ uid: user.id }, process.env.JWT_SECRET);
    const refreshToken = signRefresh({ uid: user.id }, process.env.JWT_SECRET);

    // Persist refresh token (rotation-ready)
    const refreshExp = dayjs().add(
      Number((process.env.REFRESH_TTL || '30d').replace('d', '')) || 30,
      'day'
    ).toDate();

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken, // for more security, store a hash instead
      expiresAt: refreshExp,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, phone: user.phone }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'otp_verify_failed' });
  }
});

// --- Refresh (rotation) ---
app.post('/token/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ error: 'missing_refresh' });

    // Validate signature and payload
    const payload = verifyToken(refreshToken, process.env.JWT_SECRET);
    if (!payload.rt) return res.status(401).json({ error: 'not_refresh' });

    // Check in DB (revocation / existence)
    const dbToken = await RefreshToken.findOne({ token: refreshToken, userId: payload.uid });
    if (!dbToken || dbToken.revokedAt) return res.status(401).json({ error: 'revoked_or_unknown' });
    if (dbToken.expiresAt < new Date()) return res.status(401).json({ error: 'expired' });

    // Rotate: revoke old, issue new pair
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
});

// --- Logout (revoke current refresh) ---
app.post('/logout', async (req, res) => {
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
    // Even if invalid, respond OK to make logout idempotent
    res.json({ ok: true });
  }
});

// (Optional) Access-protected test route
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  try { req.user = verifyToken(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'unauthorized' }); }
}
app.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.uid).lean();
  res.json({ user });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`auth-service :${PORT}`));
