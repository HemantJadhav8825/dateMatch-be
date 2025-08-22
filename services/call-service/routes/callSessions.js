// services/call-service/routes/callSessions.js
const express = require('express');
const CallSession = require('../models/CallSession');
const router = express.Router();

router.post('/', async (req, res) => {
  const { callerId, calleeId } = req.body;
  try {
    const session = await CallSession.create({ callerId, calleeId });

    // Emit to callee (incoming call)
    req.io.to(calleeId).emit('incoming-call', { sessionId: session._id, from: callerId });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Could not create call session' });
  }
});

module.exports = router;
