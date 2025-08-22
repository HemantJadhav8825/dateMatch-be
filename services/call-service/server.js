const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.get('/call/health', (_, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.of('/signaling').use((socket, next) => {
  const token = socket.handshake.auth?.token;
  try { socket.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { next(new Error('unauthorized')); }
});

io.of('/signaling').on('connection', (socket) => {
  socket.on('join', ({ room }) => { socket.join(room); socket.to(room).emit('peer.joined'); });
  socket.on('offer', ({ room, sdp }) => socket.to(room).emit('offer', { sdp }));
  socket.on('answer', ({ room, sdp }) => socket.to(room).emit('answer', { sdp }));
  socket.on('ice', ({ room, candidate }) => socket.to(room).emit('ice', { candidate }));
  socket.on('end', ({ room, reason }) => io.of('/signaling').to(room).emit('ended', { reason }));
});

server.listen(process.env.PORT || 5004, () => console.log('Call service on :' + (process.env.PORT || 5004)));
