// routes/call.js
const express = require('express');
const callRouter = express.Router();
const CallSession = require('../models/CallSession');
// const { verifyAccessToken } = require('../middleware/auth'); // Your JWT middleware
const { notifyUser } = require('../socket');

// Accept call
callRouter.post('/:id/accept', /* verifyAccessToken, */ async (req, res) => {
  try {
    const session = await CallSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'pending') return res.status(400).json({ error: 'Session already handled' });

    session.status = 'accepted';
    session.acceptedAt = new Date();
    await session.save();
    // inside accept endpoint after saving
    notifyUser(session.callerId.toString(), 'call_update', {
      sessionId: session._id,
      status: 'accepted',
      acceptedAt: session.acceptedAt
    });

    // Optional: Notify caller via WebSocket/Push
    // notifyUser(session.callerId, 'Call accepted', session._id);

    res.json({ message: 'Call accepted', session });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Reject call
callRouter.post('/:id/reject', /* verifyAccessToken, */ async (req, res) => {
  try {
    const session = await CallSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'pending') return res.status(400).json({ error: 'Session already handled' });

    session.status = 'rejected';
    session.rejectedAt = new Date();
    await session.save();
    // inside reject endpoint after saving
    notifyUser(session.callerId.toString(), 'call_update', {
      sessionId: session._id,
      status: 'rejected',
      rejectedAt: session.rejectedAt
    });

    // Optional: Notify caller via WebSocket/Push
    // notifyUser(session.callerId, 'Call rejected', session._id);

    res.json({ message: 'Call rejected', session });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = callRouter;