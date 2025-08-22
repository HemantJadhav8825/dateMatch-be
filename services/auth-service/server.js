const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const otp = require('./services/otp');

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('Auth Mongo connected'));

app.get('/auth/health', (_, res) => res.json({ ok: true }));

app.post('/auth/otp/start', async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const { expiresAt } = await otp.start(phone);
  res.json({ ok: true, expiresAt });
});

app.post('/auth/otp/verify', async (req, res) => {
  const { phone, code, nickname } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: 'phone and code required' });
  const ok = otp.verify(phone, code);
  if (!ok) return res.status(400).json({ error: 'invalid_or_expired_code' });

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone, nickname: nickname || '' });

  const access = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign({ uid: user.id, rt: true }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ accessToken: access, refreshToken: refresh, user: { id: user.id, phone: user.phone, nickname: user.nickname } });
});

app.post('/auth/token/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (!payload.rt) throw new Error('not refresh');
    const access = jwt.sign({ uid: payload.uid }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: access });
  } catch {
    res.status(401).json({ error: 'invalid_refresh' });
  }
});

app.listen(process.env.PORT || 5001, () => console.log('Auth service on :' + (process.env.PORT || 5001)));
