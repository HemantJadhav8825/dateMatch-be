// socket.js
const { Server } = require('socket.io');

let io;

function initSocket(ioPara) {
  io = ioPara;
  // io = new Server(server, {
  //   cors: {
  //     origin: '*', // or your frontend domain
  //     methods: ['GET', 'POST']
  //   }
  // });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins their room (by userId)
    socket.on('register', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

function notifyUser(userId, event, payload) {
  if (io) {
    io.to(userId).emit(event, payload);
  }
}

module.exports = { initSocket, notifyUser };
