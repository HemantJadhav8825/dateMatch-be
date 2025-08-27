const rateLimit = require('express-rate-limit');

exports.otpLimiter = rateLimit({
  windowMs: Number(process.env.OTP_WINDOW_MS || 60_000),
  max: Number(process.env.OTP_MAX_PER_WINDOW || 10),
});