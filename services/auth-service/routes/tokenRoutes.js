const express = require('express');
const { refreshToken, logout } = require('../controllers/tokenController');

const router = express.Router();

// Refresh token rotation
router.post('/refresh', refreshToken);

// Logout (revoke current refresh token)
router.post('/logout', logout);

module.exports = router;
