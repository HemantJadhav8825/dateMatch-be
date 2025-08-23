// services/call-service/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5004;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// --- CallSession model (Mongo) ---
const CallSessionSchema = new mongoose.Schema({
  callerId: String,
  calleeId: String,
  status: { type: String, enum: ['pending','accepted','rejected','ended'], default: 'pending' },
  room: String,            // room name used for signaling (we use sessionId)
  initiatedAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  endedAt: Date
},{ timestamps: true });

const CallSession = mongoose.models.CallSession || mongoose.model('CallSession', CallSessionSchema);

// --- Connect Mongo (optional) ---
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log('call-service: Mongo connected'))
    .catch(err => console.warn('call-service: Mongo connect failed', err.message));
} else {
  console.log('call-service: No MONGO_URI provided — using in-memory sessions (not persistent)');
}

// In-memory fallback store if no Mongo
const inMemorySessions = new Map();

// Helper: save session (Mongo if available, else memory)
async function createSession(payload) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const doc = await CallSession.create(payload);
    return doc.toObject();
  } else {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const session = { _id: id, ...payload, createdAt: new Date() };
    inMemorySessions.set(id, session);
    return session;
  }
}
async function updateSession(id, patch) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return await CallSession.findByIdAndUpdate(id, patch, { new: true }).lean();
  } else {
    const s = inMemorySessions.get(id);
    if (!s) return null;
    const updated = Object.assign(s, patch);
    inMemorySessions.set(id, updated);
    return updated;
  }
}
async function getSession(id) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return await CallSession.findById(id).lean();
  } else {
    return inMemorySessions.get(id);
  }
}

// --- HTTP endpoints ---

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Create call session (match-service or caller will call this)
// Caller must include Authorization: Bearer <token>
app.post('/call-sessions', async (req, res) => {
  try {
    const auth = (req.headers.authorization || '').replace('Bearer ','');
    if (!auth) return res.status(401).json({ error: 'missing_token' });
    const payload = jwt.verify(auth, JWT_SECRET);
    const callerId = payload.uid;
    const { calleeId } = req.body;
    if (!calleeId) return res.status(400).json({ error: 'missing calleeId' });

    const sessionPayload = {
      callerId,
      calleeId,
      status: 'pending',
      room: `session_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      initiatedAt: new Date()
    };
    const session = await createSession(sessionPayload);

    // notify callee via socket (room = calleeId)
    if (io) {
      io.of('/notify').to(calleeId).emit('incoming_call', {
        sessionId: session._id,
        from: callerId,
        room: session.room
      });
    }

    return res.json({ ok: true, session });
  } catch (err) {
    console.error('call-sessions err', err.message);
    return res.status(500).json({ error: 'failed_create_session', details: err.message });
  }
});

// optional HTTP accept/reject (can also use socket events)
app.post('/call-sessions/:id/accept', async (req, res) => {
  try {
    const auth = (req.headers.authorization || '').replace('Bearer ','');
    if (!auth) return res.status(401).json({ error: 'missing_token' });
    const payload = jwt.verify(auth, JWT_SECRET);
    const userId = payload.uid;
    const id = req.params.id;
    const session = await getSession(id);
    if (!session) return res.status(404).json({ error: 'no_session' });
    if (session.calleeId !== userId) return res.status(403).json({ error: 'not_callee' });

    const updated = await updateSession(id, { status: 'accepted', acceptedAt: new Date() });
    // notify caller that callee accepted
    io.of('/notify').to(updated.callerId).emit('call_accepted', { sessionId: updated._id, room: updated.room });
    // both clients should join signaling room = updated.room via namespace /signaling
    return res.json({ ok: true, session: updated });
  } catch (err) {
    console.error('accept err', err.message);
    return res.status(500).json({ error: 'accept_failed' });
  }
});

app.post('/call-sessions/:id/reject', async (req, res) => {
  try {
    const auth = (req.headers.authorization || '').replace('Bearer ','');
    if (!auth) return res.status(401).json({ error: 'missing_token' });
    const payload = jwt.verify(auth, JWT_SECRET);
    const userId = payload.uid;
    const id = req.params.id;
    const session = await getSession(id);
    if (!session) return res.status(404).json({ error: 'no_session' });
    if (session.calleeId !== userId) return res.status(403).json({ error: 'not_callee' });

    const updated = await updateSession(id, { status: 'rejected', rejectedAt: new Date() });
    io.of('/notify').to(updated.callerId).emit('call_rejected', { sessionId: updated._id });
    return res.json({ ok: true, session: updated });
  } catch (err) {
    console.error('reject err', err.message);
    return res.status(500).json({ error: 'reject_failed' });
  }
});


// --- WebSockets setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
});

// namespace for notifications/registration
const notifyNsp = io.of('/notify');
notifyNsp.use((socket, next) => {
  // optional JWT auth for registration - you can verify token in handshake
  const token = socket.handshake.auth?.token;
  if (!token) return next(); // allow guest registration? optional - we expect token
  try {
    const p = jwt.verify(token, JWT_SECRET);
    socket.data.uid = p.uid;
    return next();
  } catch (e) { return next(new Error('unauthorized')); }
});
notifyNsp.on('connection', (socket) => {
  // client should emit 'register' with their userId (or we can use token)
  socket.on('register', (userId) => {
    socket.join(userId);
    // console.log('notify: user registered', userId);
  });

  // client can accept/reject via socket instead of HTTP
  socket.on('call:accept', async ({ sessionId }) => {
    try {
      const session = await getSession(sessionId);
      if (!session) return socket.emit('error', { error: 'no_session' });
      await updateSession(sessionId, { status: 'accepted', acceptedAt: new Date() });
      // notify caller
      notifyNsp.to(session.callerId).emit('call_accepted', { sessionId, room: session.room });
      // notify callee that accept confirmed
      socket.emit('accepted', { sessionId, room: session.room });
    } catch (e) { socket.emit('error', { error: 'accept_failed' }); }
  });

  socket.on('call:reject', async ({ sessionId }) => {
    try {
      const session = await getSession(sessionId);
      if (!session) return socket.emit('error', { error: 'no_session' });
      await updateSession(sessionId, { status: 'rejected', rejectedAt: new Date() });
      notifyNsp.to(session.callerId).emit('call_rejected', { sessionId });
      socket.emit('rejected', { sessionId });
    } catch (e) { socket.emit('error', { error: 'reject_failed' }); }
  });

  socket.on('disconnect', () => {});
});

// namespace for WebRTC signaling
const sigNsp = io.of('/signaling');
sigNsp.use((socket, next) => {
  // verify token in handshake
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('missing_token'));
  try {
    const p = jwt.verify(token, JWT_SECRET);
    socket.data.uid = p.uid;
    return next();
  } catch (e) { return next(new Error('unauthorized')); }
});
sigNsp.on('connection', (socket) => {
  // join signaling room
  socket.on('join', ({ room }) => {
    socket.join(room);
    socket.to(room).emit('peer.joined', { uid: socket.data.uid });
  });
  socket.on('offer', ({ room, sdp }) => socket.to(room).emit('offer', { sdp, from: socket.data.uid }));
  socket.on('answer', ({ room, sdp }) => socket.to(room).emit('answer', { sdp, from: socket.data.uid }));
  socket.on('ice', ({ room, candidate }) => socket.to(room).emit('ice', { candidate, from: socket.data.uid }));
  socket.on('end', ({ room, reason }) => sigNsp.to(room).emit('ended', { reason }));
});

// start
server.listen(PORT, () => {
  console.log(`call-service running on ${PORT}`);
});
