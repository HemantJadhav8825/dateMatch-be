const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { createCallSession, acceptCall, rejectCall } = require('../controllers/callSessionController');

router.post('/create', auth, createCallSession);
router.post('/:id/accept', auth, acceptCall);
router.post('/:id/reject', auth, rejectCall);

module.exports = router;
