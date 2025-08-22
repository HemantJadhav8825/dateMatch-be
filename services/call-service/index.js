// services/call-service/server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const callRouter = require('./routes/call');
const { initSocket } = require('./socket');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' }
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// in server.js
app.use((req, res, next) => { req.io = io; next(); });

app.use('/call', callRouter);

initSocket(io);

// Authenticate socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // attach user to socket
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.userId);

  socket.on('offer', (data) => {
    // data: { to: userId, sdp }
    io.to(data.to).emit('offer', { from: socket.user.userId, sdp: data.sdp });
  });

  socket.on('answer', (data) => {
    // data: { to: userId, sdp }
    io.to(data.to).emit('answer', { from: socket.user.userId, sdp: data.sdp });
  });

  socket.on('ice-candidate', (data) => {
    // data: { to: userId, candidate }
    io.to(data.to).emit('ice-candidate', { from: socket.user.userId, candidate: data.candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.userId);
  });
});

server.listen(process.env.PORT || 5004, () => {
  console.log('Call service running on port 3003');
});
