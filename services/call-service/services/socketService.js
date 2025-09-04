const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

function initSockets(server) {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  const JWT_SECRET = process.env.JWT_SECRET;

  // Notify namespace
  const notifyNsp = io.of('/notify');
  notifyNsp.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const p = jwt.verify(token, JWT_SECRET);
      socket.data.uid = p.uid;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });
  notifyNsp.on('connection', (socket) => {
    socket.on('register', (userId) => socket.join(userId));
    socket.on('disconnect', () => {});
  });

  // Signaling namespace
  const sigNsp = io.of('/signaling');
  sigNsp.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('missing_token'));
    try {
      const p = jwt.verify(token, JWT_SECRET);
      socket.data.uid = p.uid;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });
  sigNsp.on('connection', (socket) => {
    socket.on('join', ({ room }) => {
      socket.join(room);
      socket.to(room).emit('peer.joined', { uid: socket.data.uid });
    });
    socket.on('offer', ({ room, sdp }) => socket.to(room).emit('offer', { sdp, from: socket.data.uid }));
    socket.on('answer', ({ room, sdp }) => socket.to(room).emit('answer', { sdp, from: socket.data.uid }));
    socket.on('ice', ({ room, candidate }) => socket.to(room).emit('ice', { candidate, from: socket.data.uid }));
    socket.on('end', ({ room, reason }) => sigNsp.to(room).emit('ended', { reason }));
  });
}

module.exports = { initSockets, get io() { return io; } };
