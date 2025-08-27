const express = require('express');
const { createCallSession, acceptCall, rejectCall } = require('../controllers/callSessionController');

const router = express.Router();

router.post('/', createCallSession);
router.post('/:id/accept', acceptCall);
router.post('/:id/reject', rejectCall);

module.exports = router;
