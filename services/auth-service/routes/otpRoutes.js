const express = require('express');
const { startOtp, verifyOtp } = require('../controllers/otpController');
const { otpLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/start', otpLimiter, startOtp);
router.post('/verify', otpLimiter, verifyOtp);

module.exports = router;
