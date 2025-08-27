const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const { v4: uuid } = require('uuid');
const Otp = require('../models/Otp');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { smsSender } = require('../services/smsService');
const { signAccess, signRefresh } = require('../services/tokenService');
require('dotenv').config();

const sendSMS = smsSender(process.env);

exports.startOtp = async (req, res) => {
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
};

exports.verifyOtp = async (req, res) => {
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
};
