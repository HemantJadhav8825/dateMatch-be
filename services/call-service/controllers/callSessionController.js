const jwt = require('jsonwebtoken');
const { createSession, updateSession, getSession } = require('../services/callSessionService');

const JWT_SECRET = process.env.JWT_SECRET;

exports.createCallSession = async (req, res) => {
  try {
    const auth = (req.headers.authorization || '').replace('Bearer ', '');
    if (!auth) return res.status(401).json({ error: 'missing_token' });

    const payload = jwt.verify(auth, JWT_SECRET);
    const callerId = payload.uid;
    const { calleeId } = req.body;
    if (!calleeId) return res.status(400).json({ error: 'missing calleeId' });

    const session = await createSession({
      callerId,
      calleeId,
      status: 'pending',
      room: `session_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      initiatedAt: new Date()
    });

    // Notify callee via socket
    const { io } = require('../services/socketService');
    io.of('/notify').to(calleeId).emit('incoming_call', {
      sessionId: session._id,
      from: callerId,
      room: session.room
    });

    res.json({ ok: true, session });
  } catch (err) {
    console.error('createCallSession error:', err.message);
    res.status(500).json({ error: 'failed_create_session' });
  }
};

exports.acceptCall = async (req, res) => {
  try {
    const auth = (req.headers.authorization || '').replace('Bearer ', '');
    if (!auth) return res.status(401).json({ error: 'missing_token' });

    const payload = jwt.verify(auth, JWT_SECRET);
    const userId = payload.uid;
    const sessionId = req.params.id;
    const session = await getSession(sessionId);

    if (!session) return res.status(404).json({ error: 'no_session' });
    if (session.calleeId !== userId) return res.status(403).json({ error: 'not_callee' });

    const updated = await updateSession(sessionId, { status: 'accepted', acceptedAt: new Date() });
    const { io } = require('../services/socketService');
    io.of('/notify').to(updated.callerId).emit('call_accepted', { sessionId: updated._id, room: updated.room });

    res.json({ ok: true, session: updated });
  } catch (err) {
    console.error('acceptCall error:', err.message);
    res.status(500).json({ error: 'accept_failed' });
  }
};

exports.rejectCall = async (req, res) => {
  try {
    const auth = (req.headers.authorization || '').replace('Bearer ', '');
    if (!auth) return res.status(401).json({ error: 'missing_token' });

    const payload = jwt.verify(auth, JWT_SECRET);
    const userId = payload.uid;
    const sessionId = req.params.id;
    const session = await getSession(sessionId);

    if (!session) return res.status(404).json({ error: 'no_session' });
    if (session.calleeId !== userId) return res.status(403).json({ error: 'not_callee' });

    const updated = await updateSession(sessionId, { status: 'rejected', rejectedAt: new Date() });
    const { io } = require('../services/socketService');
    io.of('/notify').to(updated.callerId).emit('call_rejected', { sessionId: updated._id });

    res.json({ ok: true, session: updated });
  } catch (err) {
    console.error('rejectCall error:', err.message);
    res.status(500).json({ error: 'reject_failed' });
  }
};
